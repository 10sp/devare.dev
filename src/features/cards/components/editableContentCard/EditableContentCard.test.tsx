import { fireEvent, render, screen } from '@testing-library/react'
import { EditableContentCard } from './EditableContentCard'

// Mock the Card and ListComponent components
jest.mock('src/components/Elements', () => ({
  ...jest.requireActual('src/components/Elements'),
  Card: ({ titleComponent, children }: any) => (
    <div>
      <div data-testid="card-header">{titleComponent}</div>
      <div data-testid="card-content">{children}</div>
    </div>
  ),
  ListComponent: ({ items, renderItem }: any) => (
    <div data-testid="list-component">
      {items.map((item: any, index: number) => (
        <div key={item.id}>{renderItem(item, index)}</div>
      ))}
    </div>
  ),
}))

describe('EditableContentCard', () => {
  const mockMeta = {
    value: 'editable-content',
    analyticsTag: 'editable-content',
    label: 'Editable Content',
    type: 'supported' as const,
  }

  const mockProps = {
    meta: mockMeta,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly in view mode', () => {
    render(<EditableContentCard {...mockProps} />)

    expect(screen.getByText('Editable Content')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('enters edit mode when Edit button is clicked', () => {
    render(<EditableContentCard {...mockProps} />)

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('+ Add Content')).toBeInTheDocument()
  })

  it('adds new content when Add Content button is clicked', () => {
    render(<EditableContentCard {...mockProps} />)

    // Enter edit mode
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Click Add Content button
    const addContentButton = screen.getByText('+ Add Content')
    fireEvent.click(addContentButton)

    // Check that input fields appear
    expect(screen.getByPlaceholderText('URL (optional)')).toBeInTheDocument()
  })

  it('saves content when Save button is clicked', () => {
    render(<EditableContentCard {...mockProps} />)

    // Enter edit mode
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    // Click Add Content button
    const addContentButton = screen.getByText('+ Add Content')
    fireEvent.click(addContentButton)

    // Fill in content
    const titleInput = screen.getByDisplayValue('New Content')
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })

    // Click Save button
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should return to view mode
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })
})
