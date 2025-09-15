import { useState } from 'react'
import { Card } from 'src/components/Elements'
import { ListComponent } from 'src/components/List'
import { useUserPreferences } from 'src/stores/preferences'
import { CardPropsType, EditableContent } from 'src/types'
import './editableContentCard.css'

export function EditableContentCard(props: CardPropsType) {
  const { meta } = props
  const { updateEditableContent } = useUserPreferences()
  const [isEditing, setIsEditing] = useState(false)
  const [editableContent, setEditableContent] = useState<EditableContent[]>(
    meta.editableContent || []
  )

  const handleAddContent = () => {
    const newContent: EditableContent = {
      id: `content-${Date.now()}`,
      title: 'New Content',
      description: 'Add your description here...',
    }
    setEditableContent([...editableContent, newContent])
  }

  const handleUpdateContent = (id: string, updatedContent: Partial<EditableContent>) => {
    setEditableContent(
      editableContent.map((content) =>
        content.id === id ? { ...content, ...updatedContent } : content
      )
    )
  }

  const handleDeleteContent = (id: string) => {
    setEditableContent(editableContent.filter((content) => content.id !== id))
  }

  const handleSaveContent = () => {
    // Save to user preferences
    updateEditableContent(meta.value, editableContent)
    setIsEditing(false)
  }

  const renderItem = (item: EditableContent, index: number) => (
    <EditableContentItem
      key={item.id}
      item={item}
      isEditing={isEditing}
      onUpdate={handleUpdateContent}
      onDelete={handleDeleteContent}
    />
  )

  const HeaderTitle = () => {
    return (
      <div className="editable-card-header">
        <span>{meta.label}</span>
        <div className="editable-card-actions">
          {isEditing ? (
            <>
              <button className="save-button" onClick={handleSaveContent}>
                Save
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  // Reset to original content when canceling
                  setEditableContent(meta.editableContent || [])
                  setIsEditing(false)
                }}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card titleComponent={<HeaderTitle />} {...props}>
      {isEditing && (
        <div className="add-content-button-container">
          <button className="add-content-button" onClick={handleAddContent}>
            + Add Content
          </button>
        </div>
      )}
      <ListComponent items={editableContent} isLoading={false} renderItem={renderItem} />
    </Card>
  )
}

type EditableContentItemProps = {
  item: EditableContent
  isEditing: boolean
  onUpdate: (id: string, updatedContent: Partial<EditableContent>) => void
  onDelete: (id: string) => void
}

const EditableContentItem = ({ item, isEditing, onUpdate, onDelete }: EditableContentItemProps) => {
  if (isEditing) {
    return (
      <div className="editable-content-item editing">
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdate(item.id, { title: e.target.value })}
          className="content-title-input"
        />
        <textarea
          value={item.description}
          onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          className="content-description-input"
        />
        {item.url && (
          <input
            type="text"
            value={item.url}
            onChange={(e) => onUpdate(item.id, { url: e.target.value })}
            className="content-url-input"
            placeholder="URL (optional)"
          />
        )}
        <div className="content-item-actions">
          <button className="delete-button" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="editable-content-item">
      <h3 className="content-title">{item.title}</h3>
      <p className="content-description">{item.description}</p>
      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="content-url">
          {item.url}
        </a>
      )}
      {item.tags && (
        <div className="content-tags">
          {item.tags.map((tag, index) => (
            <span key={index} className="content-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
