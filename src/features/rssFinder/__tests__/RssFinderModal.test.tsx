import { render, screen } from '@testing-library/react'
import { RssFinderModal } from '../components/RssFinderModal'

// Mock the useUserPreferences hook
jest.mock('src/stores/preferences', () => ({
  useUserPreferences: () => ({
    userCustomCards: [],
    setUserCustomCards: jest.fn(),
    cards: [],
    setCards: jest.fn(),
  }),
}))

// Mock the getRssUrlFeed function
jest.mock('src/features/cards', () => ({
  getRssUrlFeed: jest.fn().mockResolvedValue({
    title: 'Test Feed',
    link: 'https://example.com',
    icon: '📰',
  }),
}))

describe('RssFinderModal', () => {
  it('renders without crashing', () => {
    render(<RssFinderModal isOpen={true} onClose={jest.fn()} />)

    expect(screen.getByText('RSS Feed Finder')).toBeInTheDocument()
    expect(screen.getByText('Website URL')).toBeInTheDocument()
  })

  it('shows error message for invalid URL', async () => {
    render(<RssFinderModal isOpen={true} onClose={jest.fn()} />)

    // The component should show an error for empty URL
    // This test would need to be expanded with user interaction testing
  })
})
