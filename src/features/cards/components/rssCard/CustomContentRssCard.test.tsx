import { render } from '@testing-library/react'
import { Article } from 'src/types'
import { CustomContentRssCard } from './CustomContentRssCard'

// Mock the dependencies
jest.mock('src/stores/preferences', () => ({
  useUserPreferences: () => ({
    userCustomCards: [],
    updateUserCustomCards: jest.fn(),
  }),
}))

jest.mock('./SortableArticleItem', () => ({
  SortableArticleItem: ({ item, index }: { item: Article; index: number }) => (
    <div data-testid={`sortable-article-${index}`}>{item.title}</div>
  ),
}))

describe('CustomContentRssCard', () => {
  const mockMeta = {
    value: 'test-rss',
    analyticsTag: 'test-rss',
    label: 'Test RSS Feed',
    type: 'rss' as const,
    customContent: [
      {
        id: '1',
        title: 'Test Article 1',
        url: 'https://example.com/1',
        published_at: Date.now(),
        tags: ['test'],
      },
      {
        id: '2',
        title: 'Test Article 2',
        url: 'https://example.com/2',
        published_at: Date.now(),
        tags: ['test'],
      },
    ],
  }

  it('renders correctly with custom content', () => {
    const { getByText } = render(<CustomContentRssCard meta={mockMeta} />)

    expect(getByText('Test RSS Feed')).toBeInTheDocument()
    expect(getByText('Test Article 1')).toBeInTheDocument()
    expect(getByText('Test Article 2')).toBeInTheDocument()
  })
})
