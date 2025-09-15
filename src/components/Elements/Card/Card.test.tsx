import { fireEvent, render, screen } from '@testing-library/react'
import * as preferencesStore from 'src/stores/preferences'
import { Card } from './Card'

// Mock the useUserPreferences hook
const mockUseUserPreferences = {
  openLinksNewTab: true,
  isOrganizeMode: false,
  setIsOrganizeMode: jest.fn(),
}

jest.spyOn(preferencesStore, 'useUserPreferences').mockImplementation(() => mockUseUserPreferences)

const mockMeta = {
  value: 'test-card',
  analyticsTag: 'test',
  label: 'Test Card',
  type: 'supported' as const,
}

describe('Card', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly in normal mode', () => {
    render(
      <Card meta={mockMeta}>
        <div>Test Content</div>
      </Card>
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('hides content in organize mode', () => {
    // Mock the hook to return organize mode
    jest.spyOn(preferencesStore, 'useUserPreferences').mockImplementation(() => ({
      ...mockUseUserPreferences,
      isOrganizeMode: true,
    }))

    render(
      <Card meta={mockMeta}>
        <div>Test Content</div>
      </Card>
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('enters organize mode on double click of drag button', () => {
    render(
      <Card meta={mockMeta}>
        <div>Test Content</div>
      </Card>
    )

    const cardElement = screen.getByText('Test Card').closest('.block')
    const dragButton = document.createElement('button')
    dragButton.className = 'blockHeaderDragButton'
    cardElement?.querySelector('.blockHeader')?.appendChild(dragButton)

    fireEvent.doubleClick(dragButton)

    expect(mockUseUserPreferences.setIsOrganizeMode).toHaveBeenCalledWith(true)
  })
})
