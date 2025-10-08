import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Card } from 'src/components/Elements'
import { NotificationOverlay } from 'src/components/Elements/NotificationOverlay'
import { ListComponent } from 'src/components/List'
import { useUserPreferences } from 'src/stores/preferences'
import { CardPropsType, EditableContent } from 'src/types'
import './editableContentCard.css'

// Define block types for Notion-like functionality
type BlockType =
  | 'to_do'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulleted_list'
  | 'numbered_list'
  | 'quote'
  | 'divider'
  | 'paragraph'

interface NotionBlock extends EditableContent {
  type: BlockType
  properties?: {
    checked?: boolean
    level?: number
  }
}

// Text-to-speech helper function
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    speechSynthesis.speak(utterance)
  }
}

export function EditableContentCard(props: CardPropsType) {
  const { meta } = props
  const { updateEditableContent, userCustomCards } = useUserPreferences()
  const [editableContent, setEditableContent] = useState<NotionBlock[]>(() => {
    // First check if there's persisted content in userCustomCards
    const customCard = userCustomCards.find((card) => card.value === meta.value)
    if (customCard?.editableContent) {
      return customCard.editableContent.map((item) => ({
        ...item,
        type: (item.type as BlockType) || 'to_do',
      })) as NotionBlock[]
    }
    // Fallback to meta.editableContent or empty array
    return meta.editableContent
      ? (meta.editableContent.map((item) => ({
          ...item,
          type: (item.type as BlockType) || 'to_do',
        })) as NotionBlock[])
      : []
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isUsingTextarea, setIsUsingTextarea] = useState(false)
  const [viewingMedia, setViewingMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(
    null
  )
  const [activeSlashMenu, setActiveSlashMenu] = useState<{
    index: number
    position: { x: number; y: number }
  } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([])

  // Block type definitions with icons and descriptions
  const BLOCK_TYPES = [
    { type: 'to_do', name: 'To-do list', icon: '✓', description: 'Track tasks with a to-do list.' },
    { type: 'heading1', name: 'Heading 1', icon: 'H1', description: 'Big section heading.' },
    { type: 'heading2', name: 'Heading 2', icon: 'H2', description: 'Medium section heading.' },
    { type: 'heading3', name: 'Heading 3', icon: 'H3', description: 'Small section heading.' },
    {
      type: 'bulleted_list',
      name: 'Bulleted list',
      icon: '•',
      description: 'Create a simple bulleted list.',
    },
    {
      type: 'numbered_list',
      name: 'Numbered list',
      icon: '1.',
      description: 'Create a list with numbering.',
    },
    { type: 'quote', name: 'Quote', icon: '❝', description: 'Capture a quote.' },
    { type: 'divider', name: 'Divider', icon: '—', description: 'Visually divide blocks.' },
    {
      type: 'paragraph',
      name: 'Text',
      icon: 'T',
      description: 'Just start writing with plain text.',
    },
  ]

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
  })

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<NotionBlock | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Focus the input when the component mounts
  useEffect(() => {
    if (!isUsingTextarea && inputRef.current) {
      inputRef.current.focus()
    } else if (isUsingTextarea && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isUsingTextarea])

  // Reminder check effect - improved to check every 10 seconds for better accuracy
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now()
      editableContent.forEach((item) => {
        if (
          item.reminderEnabled &&
          item.reminderTime &&
          item.reminderTime <= now &&
          !item.completed
        ) {
          // Show notification
          setNotification({
            isVisible: true,
            message: `Reminder: ${item.title}`,
          })

          // Speak the reminder
          speakText(`Reminder: ${item.title}`)

          // Disable the reminder so it doesn't repeat
          handleUpdateContent(item.id, { reminderEnabled: false })
        }
      })
    }

    // Check immediately on mount
    checkReminders()

    // Then check every 10 seconds
    const interval = setInterval(checkReminders, 10000)

    return () => clearInterval(interval)
  }, [editableContent])

  // Handle paste events for media and rich content
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()

    // Get plain text
    const text = e.clipboardData.getData('text/plain')

    // Check for files (images, etc.)
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      // Handle images
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile()
        if (blob) {
          // Create a data URL for the image
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              const imageDataUrl = event.target.result as string

              // If there's text, use it as title, otherwise use "Image"
              const title = text.trim() || 'Image'

              // Add the image as a new todo item with description
              const newContent: NotionBlock = {
                id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: title,
                description: imageDataUrl,
                completed: false,
                reminderEnabled: false,
                reminderTime: undefined,
                isImage: true,
                type: 'to_do',
              }
              const updatedContent = [...editableContent, newContent]
              setEditableContent(updatedContent)
              updateEditableContent(meta.value, updatedContent)
            }
          }
          reader.readAsDataURL(blob)
        }
        return
      }
    }

    // Handle plain text
    if (text) {
      // If we're in the add todo input, add as new todo
      if (e.target === inputRef.current || e.target === textareaRef.current) {
        handleAddContent(text)
      }
      // If we're in an edit field, insert text at cursor position
      else {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement
        const start = target.selectionStart || 0
        const end = target.selectionEnd || 0
        const newValue = target.value.substring(0, start) + text + target.value.substring(end)
        target.value = newValue
        target.selectionStart = target.selectionEnd = start + text.length
      }
    }
  }

  const handleAddContent = (title: string = '') => {
    const trimmedTitle = title.trim()
    if (trimmedTitle) {
      const newContent: NotionBlock = {
        id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: trimmedTitle,
        description: '',
        completed: false,
        reminderEnabled: false,
        reminderTime: undefined,
        type: 'to_do',
      }
      const updatedContent = [...editableContent, newContent]
      setEditableContent(updatedContent)
      updateEditableContent(meta.value, updatedContent)

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      if (textareaRef.current) {
        textareaRef.current.value = ''
      }
      setIsUsingTextarea(false)
    }
  }

  const handleUpdateContent = (id: string, updatedContent: Partial<NotionBlock>) => {
    const updated = editableContent.map((content) =>
      content.id === id ? { ...content, ...updatedContent } : content
    )
    setEditableContent(updated)
    updateEditableContent(meta.value, updated)
  }

  const handleToggleComplete = (id: string, completed: boolean) => {
    handleUpdateContent(id, { completed })
  }

  const handleDeleteContent = (id: string) => {
    const updated = editableContent.filter((content) => content.id !== id)
    setEditableContent(updated)
    updateEditableContent(meta.value, updated)
  }

  const handleAddTodoOnKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    // Ctrl+Enter or Cmd+Enter for new line
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (isUsingTextarea) {
        // Insert newline in textarea
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const text = target.value
        target.value = text.substring(0, start) + '\n' + text.substring(end)
        target.selectionStart = target.selectionEnd = start + 1
      } else {
        // Switch to textarea mode
        const inputValue = (e.target as HTMLInputElement).value
        setIsUsingTextarea(true)
        // Wait for next tick to set textarea value
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.value = inputValue
            textareaRef.current.focus()
          }
        }, 0)
      }
      e.preventDefault()
      return
    }

    // Enter (without Ctrl/Cmd) to add todo or create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      if (typeof index === 'number') {
        // We're in a Notion block
        e.preventDefault()
        addBlock(index)
      } else {
        // We're in the add todo input
        const target = e.target as HTMLInputElement | HTMLTextAreaElement
        if (target.value.trim()) {
          handleAddContent(target.value.trim())
        }
        e.preventDefault()
      }
    }

    // Backspace on empty input to delete block
    if (e.key === 'Backspace' && typeof index === 'number') {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      if (target.value === '') {
        e.preventDefault()
        if (editableContent.length > 1) {
          deleteBlock(editableContent[index].id)
          // Focus the previous block
          setTimeout(() => {
            if (inputRefs.current[index - 1]) {
              inputRefs.current[index - 1]?.focus()
            }
          }, 10)
        }
      }
    }

    // Slash command to open menu
    if (e.key === '/' && typeof index === 'number') {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      if (target.value === '') {
        e.preventDefault()
        const rect = target.getBoundingClientRect()
        setActiveSlashMenu({
          index,
          position: { x: rect.left, y: rect.bottom },
        })
      }
    }

    // Escape to clear
    if (e.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.focus()
      }
      if (textareaRef.current) {
        textareaRef.current.value = ''
      }
      setIsUsingTextarea(false)
      e.preventDefault()
    }
  }

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim()
    if (value) {
      handleAddContent(value)
    }
    setIsUsingTextarea(false)
  }

  const handleSetReminder = (id: string, minutes: number) => {
    const reminderTime = Date.now() + minutes * 60 * 1000
    handleUpdateContent(id, {
      reminderEnabled: true,
      reminderTime,
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: EditableContent) => {
    setDraggedItem(item as NotionBlock)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedItem) {
      const draggedIndex = editableContent.findIndex((item) => item.id === draggedItem.id)

      if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
        const newContent = [...editableContent]
        const [removed] = newContent.splice(draggedIndex, 1)
        newContent.splice(dropIndex, 0, removed)
        setEditableContent(newContent)
        updateEditableContent(meta.value, newContent)
      }
    }

    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const renderItem = (item: EditableContent, index: number) => (
    <EditableContentItem
      key={item.id}
      item={item}
      index={index}
      onUpdate={handleUpdateContent}
      onToggleComplete={handleToggleComplete}
      onDelete={handleDeleteContent}
      onSetReminder={handleSetReminder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      isDraggedOver={dragOverIndex === index}
      onViewMedia={setViewingMedia}
      addBlock={addBlock}
      deleteBlock={deleteBlock}
      setActiveSlashMenu={setActiveSlashMenu}
      inputRefs={inputRefs}
      items={editableContent}
    />
  )

  const HeaderTitle = () => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
        <span>{meta.label}</span>
        {editableContent.length > 0 && (
          <span style={{ fontSize: '14px', opacity: 0.7 }}>
            {editableContent.filter((item) => !item.completed).length} / {editableContent.length}
          </span>
        )}
      </div>
    )
  }

  // Add a new block
  const addBlock = (index: number, type: BlockType = 'to_do') => {
    const newBlock: NotionBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: '',
      description: '',
      completed: false,
      reminderEnabled: false,
      reminderTime: undefined,
      properties: type === 'to_do' ? { checked: false } : undefined,
    }

    const newContent = [...editableContent]
    newContent.splice(index + 1, 0, newBlock)
    setEditableContent(newContent)
    updateEditableContent(meta.value, newContent)

    // Focus the new block after a short delay
    setTimeout(() => {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus()
      }
    }, 10)
  }

  // Update a block
  const updateBlock = (id: string, updates: Partial<NotionBlock>) => {
    const updated = editableContent.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    ) as NotionBlock[]
    setEditableContent(updated)
    updateEditableContent(meta.value, updated)
  }

  // Delete a block
  const deleteBlock = (id: string) => {
    const updated = editableContent.filter((block) => block.id !== id) as NotionBlock[]
    setEditableContent(updated)
    updateEditableContent(meta.value, updated)
  }

  // Handle slash command selection
  const handleSlashCommand = (index: number, type: BlockType) => {
    updateBlock(editableContent[index].id, { type })
    setActiveSlashMenu(null)

    // Focus the block after type change
    setTimeout(() => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]?.focus()
      }
    }, 10)
  }

  // Render slash command menu
  const renderSlashMenu = () => {
    if (!activeSlashMenu) return null

    return (
      <div
        className="slash-menu"
        style={{
          position: 'fixed',
          left: activeSlashMenu.position.x,
          top: activeSlashMenu.position.y,
        }}>
        {BLOCK_TYPES.map((blockType) => (
          <div
            key={blockType.type}
            className="slash-menu-item"
            onClick={() => handleSlashCommand(activeSlashMenu.index, blockType.type as BlockType)}>
            <div className="slash-menu-item-icon">{blockType.icon}</div>
            <div className="slash-menu-item-text">{blockType.name}</div>
            <div className="slash-menu-item-desc">{blockType.description}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card titleComponent={<HeaderTitle />} {...props}>
        {isUsingTextarea ? (
          <textarea
            ref={textareaRef}
            placeholder="+ Add a todo (Press Enter to save, Ctrl+Enter for new line)"
            className="add-todo-textarea"
            onKeyDown={handleAddTodoOnKeyDown}
            onBlur={handleTextareaBlur}
            onPaste={handlePaste}
            autoFocus
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder="+ Add a todo (Press Enter to save, Ctrl+Enter for multiline)"
            className="add-todo-input"
            onKeyDown={handleAddTodoOnKeyDown}
            onPaste={handlePaste}
          />
        )}
        {editableContent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">No todos yet. Add one above to get started!</div>
          </div>
        ) : (
          <ListComponent items={editableContent} isLoading={false} renderItem={renderItem} />
        )}
      </Card>
      <NotificationOverlay
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ isVisible: false, message: '' })}
      />

      {/* Media viewer modal */}
      {viewingMedia && (
        <div className="media-viewer-overlay" onClick={() => setViewingMedia(null)}>
          <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
            {viewingMedia.type === 'image' ? (
              <img src={viewingMedia.url} alt="Full size view" className="media-viewer-image" />
            ) : (
              <video src={viewingMedia.url} controls className="media-viewer-video" />
            )}
            <button className="media-viewer-close" onClick={() => setViewingMedia(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

type EditableContentItemProps = {
  item: EditableContent
  index: number
  onUpdate: (id: string, updatedContent: Partial<EditableContent>) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onSetReminder: (id: string, minutes: number) => void
  onDragStart: (e: React.DragEvent, item: EditableContent) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  isDraggedOver: boolean
  onViewMedia: (media: { url: string; type: 'image' | 'video' }) => void
  addBlock: (index: number, type?: BlockType) => void
  deleteBlock: (id: string) => void
  setActiveSlashMenu: (menu: { index: number; position: { x: number; y: number } } | null) => void
  inputRefs: React.RefObject<(HTMLInputElement | HTMLTextAreaElement | null)[]>
  items: EditableContent[]
}

const EditableContentItem = ({
  item,
  index,
  onUpdate,
  onToggleComplete,
  onDelete,
  onSetReminder,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDraggedOver,
  onViewMedia,
  addBlock,
  deleteBlock,
  setActiveSlashMenu,
  inputRefs,
  items,
}: EditableContentItemProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(item.title)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [isUsingTextarea, setIsUsingTextarea] = useState(item.title.includes('\n'))
  const [showReminderOptions, setShowReminderOptions] = useState(false)
  const [showCustomTimer, setShowCustomTimer] = useState(false)
  const [customMinutes, setCustomMinutes] = useState(10)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [tempDescription, setTempDescription] = useState(item.description || '')

  // Handle paste events for editing
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()

    // Get plain text
    const text = e.clipboardData.getData('text/plain')

    // Check for files (images, etc.)
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      const itemClipboard = items[i]

      // Handle images
      if (itemClipboard.type.indexOf('image') !== -1) {
        const blob = itemClipboard.getAsFile()
        if (blob) {
          // Create a data URL for the image
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              const imageDataUrl = event.target.result as string

              // Update the item with the image in description
              onUpdate(item.id, { description: imageDataUrl, isImage: true })
              setTempDescription(imageDataUrl)
            }
          }
          reader.readAsDataURL(blob)
        }
        return
      }
    }

    // Handle plain text
    if (text) {
      // If we're in an edit field, insert text at cursor position
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      const start = target.selectionStart || 0
      const end = target.selectionEnd || 0
      const newValue = target.value.substring(0, start) + text + target.value.substring(end)
      target.value = newValue
      if (target === titleInputRef.current || target === titleTextareaRef.current) {
        setTempTitle(newValue)
      } else {
        setTempDescription(newValue)
      }
      target.selectionStart = target.selectionEnd = start + text.length
    }
  }

  const handleStartEditing = () => {
    setIsEditingTitle(true)
    setTempTitle(item.title)
    setIsUsingTextarea(item.title.includes('\n'))
  }

  const handleStartEditingDescription = () => {
    setIsEditingDescription(true)
    setTempDescription(item.description || '')
  }

  const handleSaveEditing = () => {
    const trimmedTitle = tempTitle.trim()
    if (trimmedTitle && trimmedTitle !== item.title) {
      onUpdate(item.id, { title: trimmedTitle })
    }
    setIsEditingTitle(false)
    setIsUsingTextarea(false)
  }

  const handleSaveDescriptionEditing = () => {
    const trimmedDescription = tempDescription.trim()
    if (trimmedDescription !== (item.description || '')) {
      onUpdate(item.id, { description: trimmedDescription })
    }
    setIsEditingDescription(false)
  }

  const handleCancelEditing = () => {
    setTempTitle(item.title)
    setIsEditingTitle(false)
    setIsUsingTextarea(false)
  }

  const handleCancelDescriptionEditing = () => {
    setTempDescription(item.description || '')
    setIsEditingDescription(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter for new line
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (isUsingTextarea) {
        // Insert newline in textarea
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const text = target.value
        target.value = text.substring(0, start) + '\n' + text.substring(end)
        target.selectionStart = target.selectionEnd = start + 1
      } else {
        // Switch to textarea mode
        setIsUsingTextarea(true)
        setTempTitle((e.target as HTMLInputElement).value)
      }
      e.preventDefault()
      return
    }

    // Enter (without Ctrl/Cmd) to save
    if (e.key === 'Enter' && !e.shiftKey) {
      if (isUsingTextarea) {
        handleSaveEditing()
      } else {
        const target = e.target as HTMLInputElement
        setTempTitle(target.value)
        handleSaveEditing()
      }
      e.preventDefault()
    }

    // Escape to cancel
    if (e.key === 'Escape') {
      handleCancelEditing()
      e.preventDefault()
    }
  }

  // Handle key events for Notion-like blocks
  const handleBlockKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter for new line
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (isUsingTextarea) {
        // Insert newline in textarea
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const text = target.value
        target.value = text.substring(0, start) + '\n' + text.substring(end)
        target.selectionStart = target.selectionEnd = start + 1
      } else {
        // Switch to textarea mode
        setIsUsingTextarea(true)
        setTempTitle((e.target as HTMLInputElement).value)
      }
      e.preventDefault()
      return
    }

    // Enter (without Ctrl/Cmd) to create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addBlock(index)
    }

    // Backspace on empty input to delete block
    if (e.key === 'Backspace') {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      if (target.value === '') {
        e.preventDefault()
        if (items.length > 1) {
          deleteBlock(item.id)
          // Focus the previous block
          setTimeout(() => {
            if (inputRefs.current[index - 1]) {
              inputRefs.current[index - 1]?.focus()
            }
          }, 10)
        }
      }
    }

    // Slash command to open menu
    if (e.key === '/' && e.currentTarget.value === '') {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      setActiveSlashMenu({
        index,
        position: { x: rect.left, y: rect.bottom },
      })
    }

    // Escape to cancel
    if (e.key === 'Escape') {
      handleCancelEditing()
      e.preventDefault()
    }
  }

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSaveDescriptionEditing()
      e.preventDefault()
      return
    }

    // Enter to save (but not Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSaveDescriptionEditing()
      e.preventDefault()
      return
    }

    // Escape to cancel
    if (e.key === 'Escape') {
      handleCancelDescriptionEditing()
      e.preventDefault()
    }
  }

  // Focus the input/textarea when editing starts
  useEffect(() => {
    if (isEditingTitle) {
      if (isUsingTextarea && titleTextareaRef.current) {
        titleTextareaRef.current.focus()
      } else if (titleInputRef.current) {
        titleInputRef.current.focus()
      }
    }
  }, [isEditingTitle, isUsingTextarea])

  const handleReminderClick = () => {
    setShowReminderOptions(!showReminderOptions)
    setShowCustomTimer(false) // Hide custom timer when toggling reminder options
  }

  const handleSetReminder = (minutes: number) => {
    onSetReminder(item.id, minutes)
    setShowReminderOptions(false)
  }

  const handleCustomTimerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSetReminder(customMinutes)
  }

  const handleViewMedia = () => {
    if (item.isImage && item.description) {
      onViewMedia({ url: item.description, type: 'image' })
    }
  }

  // Render block based on type
  const renderBlock = () => {
    const block = item as NotionBlock
    const setRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      if (inputRefs && inputRefs.current) {
        inputRefs.current[index] = el
      }
    }

    switch (block.type) {
      case 'heading1':
        return (
          <input
            ref={setRef}
            type="text"
            value={block.title}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            onPaste={handlePaste}
            placeholder="Heading 1"
            className="todo-title-input heading1-input"
          />
        )
      case 'heading2':
        return (
          <input
            ref={setRef}
            type="text"
            value={block.title}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            onPaste={handlePaste}
            placeholder="Heading 2"
            className="todo-title-input heading2-input"
          />
        )
      case 'heading3':
        return (
          <input
            ref={setRef}
            type="text"
            value={block.title}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            onPaste={handlePaste}
            placeholder="Heading 3"
            className="todo-title-input heading3-input"
          />
        )
      case 'bulleted_list':
        return (
          <div className="list-block">
            <span className="list-bullet">•</span>
            <input
              ref={setRef}
              type="text"
              value={block.title}
              onChange={(e) => onUpdate(block.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              onPaste={handlePaste}
              placeholder="List item"
              className="todo-title-input list-input"
            />
          </div>
        )
      case 'numbered_list':
        return (
          <div className="list-block">
            <span className="list-number">{index + 1}.</span>
            <input
              ref={setRef}
              type="text"
              value={block.title}
              onChange={(e) => onUpdate(block.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              onPaste={handlePaste}
              placeholder="List item"
              className="todo-title-input list-input"
            />
          </div>
        )
      case 'quote':
        return (
          <div className="quote-block">
            <div className="quote-bar"></div>
            <input
              ref={setRef}
              type="text"
              value={block.title}
              onChange={(e) => onUpdate(block.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              onPaste={handlePaste}
              placeholder="Quote"
              className="todo-title-input quote-input"
            />
          </div>
        )
      case 'divider':
        return (
          <div className="divider-block">
            <div className="divider-line"></div>
          </div>
        )
      case 'paragraph':
        return (
          <input
            ref={setRef}
            type="text"
            value={block.title}
            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            onPaste={handlePaste}
            placeholder="Paragraph"
            className="todo-title-input"
          />
        )
      case 'to_do':
      default:
        return (
          <>
            <input
              type="checkbox"
              checked={!!block.completed}
              onChange={(e) => onToggleComplete(block.id, e.target.checked)}
              className="todo-checkbox"
            />
            <input
              ref={setRef}
              type="text"
              value={block.title}
              onChange={(e) => {
                onUpdate(block.id, { title: e.target.value })
              }}
              onKeyDown={handleBlockKeyDown}
              onPaste={handlePaste}
              className={`todo-title-input ${block.completed ? 'completed' : ''}`}
              placeholder="To-do"
            />
          </>
        )
    }
  }

  return (
    <div
      className={`editable-content-item todo-item ${isDraggedOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}>
      <div className="todo-content">
        <div className="todo-main-content">
          <div className="todo-title-wrapper">{renderBlock()}</div>

          {/* Description section */}
          {isEditingDescription ? (
            <div className="todo-description-edit">
              {item.isImage ? (
                <div className="todo-image-wrapper">
                  <img src={tempDescription} alt="Todo attachment" className="todo-image" />
                </div>
              ) : null}
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                onBlur={handleSaveDescriptionEditing}
                onPaste={handlePaste}
                placeholder="Add description..."
                className="todo-description-textarea"
                autoFocus
              />
            </div>
          ) : item.description ? (
            <div
              className={`todo-description ${item.isImage ? 'todo-image-description' : ''}`}
              onClick={item.isImage ? handleViewMedia : handleStartEditingDescription}>
              {item.isImage ? (
                <div className="todo-image-wrapper">
                  <img src={item.description} alt="Todo attachment" className="todo-image" />
                  <div className="todo-image-overlay">
                    <span className="todo-image-label">Click to view</span>
                  </div>
                </div>
              ) : (
                <div className="todo-text-description">{item.description}</div>
              )}
            </div>
          ) : (
            <div
              className="todo-description todo-description-placeholder"
              onClick={handleStartEditingDescription}>
              Add description...
            </div>
          )}
        </div>
        <div className="content-item-actions">
          <button
            className={`reminder-button ${item.reminderEnabled ? 'active' : ''}`}
            onClick={handleReminderClick}
            title={item.reminderEnabled ? 'Reminder set' : 'Set reminder'}>
            ⏰
          </button>
          <button className="delete-button" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>

      {showReminderOptions && (
        <div className="reminder-options">
          <button onClick={() => handleSetReminder(1)}>1 min</button>
          <button onClick={() => handleSetReminder(5)}>5 min</button>
          <button onClick={() => handleSetReminder(10)}>10 min</button>
          <button onClick={() => handleSetReminder(30)}>30 min</button>
          <button onClick={() => handleSetReminder(60)}>1 hour</button>
          <button onClick={() => setShowCustomTimer(true)}>Custom</button>
        </div>
      )}

      {showCustomTimer && (
        <form className="custom-timer-form" onSubmit={handleCustomTimerSubmit}>
          <input
            type="number"
            min="1"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            className="custom-timer-input"
          />
          <span>minutes</span>
          <button type="submit" className="set-timer-button">
            Set
          </button>
          <button
            type="button"
            className="cancel-timer-button"
            onClick={() => setShowCustomTimer(false)}>
            Cancel
          </button>
        </form>
      )}

      {item.reminderEnabled && item.reminderTime && (
        <div className="reminder-info">
          Reminder set for{' '}
          {new Date(item.reminderTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}
