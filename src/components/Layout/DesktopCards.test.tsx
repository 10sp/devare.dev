import { render, screen } from '@testing-library/react'
import * as preferencesStore from 'src/stores/preferences'
import { SupportedCardType } from 'src/types'
import { DesktopCards } from './DesktopCards'

// Mock the useUserPreferences hook
const mockUseUserPreferences = {
  updateCardOrder: jest.fn(),
  isOrganizeMode: false,
  setIsOrganizeMode: jest.fn(),
}

jest.spyOn(preferencesStore, 'useUserPreferences').mockImplementation(() => mockUseUserPreferences)

const mockCards = [
  { id: 0, name: 'github', type: 'supported' as const },
  { id: 1, name: 'hackernews', type: 'supported' as const },
]

const mockUserCustomCards: SupportedCardType[] = []

describe('DesktopCards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders cards in normal mode', () => {
    render(<DesktopCards cards={mockCards} userCustomCards={mockUserCustomCards} />)

    expect(screen.getByText('Github')).toBeInTheDocument()
    expect(screen.getByText('Hacker News')).toBeInTheDocument()
  })

  it('shows organize mode header when in organize mode', () => {
    // Mock the hook to return organize mode
    jest.spyOn(preferencesStore, 'useUserPreferences').mockImplementation(() => ({
      ...mockUseUserPreferences,
      isOrganizeMode: true,
    }))

    render(<DesktopCards cards={mockCards} userCustomCards={mockUserCustomCards} />)

    expect(screen.getByText('Organize Cards')).toBeInTheDocument()
    expect(
      screen.getByText('Drag and drop cards to reorder them. Press ESC to exit.')
    ).toBeInTheDocument()
  })
})
