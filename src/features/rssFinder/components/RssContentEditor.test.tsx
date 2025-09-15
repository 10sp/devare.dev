import { render, screen } from '@testing-library/react'
import { RssContentEditor } from './RssContentEditor'

// Mock the useUserPreferences hook
const mockUseUserPreferences = {
  userCustomCards: [],
  setUserCustomCards: jest.fn(),
  cards: [],
  setCards: jest.fn(),
}

jest.mock('src/stores/preferences', () => ({
  useUserPreferences: () => mockUseUserPreferences,
}))

describe('RssContentEditor', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    feed: {
      url: 'https://example.com/rss',
      title: 'Example RSS Feed',
      type: 'application/rss+xml',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<RssContentEditor {...mockProps} />)

    expect(screen.getByText('RSS Content Editor')).toBeInTheDocument()
    expect(screen.getByText('Example RSS Feed')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/rss')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<RssContentEditor {...mockProps} />)

    expect(screen.getByText('Loading articles...')).toBeInTheDocument()
  })
})
