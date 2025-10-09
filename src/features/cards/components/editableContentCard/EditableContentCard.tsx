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
  | 'toggle'
  | 'callout'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'gallery'

// Create a new interface that includes all the properties we need
interface NotionBlock {
  id: string
  title: string
  description: string
  url?: string
  tags?: string[]
  published_at?: number
  completed?: boolean
  reminderEnabled?: boolean
  reminderTime?: number
  isImage?: boolean
  type: BlockType
  properties?: {
    checked?: boolean
    level?: number
    language?: string
    emoji?: string
    isOpen?: boolean
    // Media properties
    mediaUrl?: string
    caption?: string
    filename?: string
    images?: string[]
    layout?: 'grid' | 'carousel'
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
        type: (item.type as BlockType) || 'paragraph',
        // Ensure completed property is properly set for todo items
        completed: item.type === 'to_do' ? (item.completed || false) : item.completed,
      })) as NotionBlock[]
    }
    // Fallback to meta.editableContent or empty array
    return meta.editableContent
      ? (meta.editableContent.map((item) => ({
          ...item,
          type: (item.type as BlockType) || 'paragraph',
          // Ensure completed property is properly set for todo items
          completed: item.type === 'to_do' ? (item.completed || false) : item.completed,
        })) as NotionBlock[])
      : []
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const [viewingMedia, setViewingMedia] = useState<{
    url: string
    type: 'image' | 'video' | 'audio'
  } | null>(null)
  const [activeSlashMenu, setActiveSlashMenu] = useState<{
    index: number
    position: { x: number; y: number }
  } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([])

  // Block type definitions with icons and descriptions
  const BLOCK_TYPES = [
    {
      type: 'paragraph',
      name: 'Text',
      icon: 'T',
      description: 'Just start writing with plain text.',
    },
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
    {
      type: 'toggle',
      name: 'Toggle list',
      icon: '▶',
      description: 'Toggles can hide and show content inside.',
    },
    { type: 'quote', name: 'Quote', icon: '❝', description: 'Capture a quote.' },
    { type: 'divider', name: 'Divider', icon: '—', description: 'Visually divide blocks.' },
    { type: 'callout', name: 'Callout', icon: '💡', description: 'Make writing stand out.' },
    { type: 'code', name: 'Code', icon: '</>', description: 'Capture a code snippet.' },
    { type: 'image', name: 'Image', icon: '🖼️', description: 'Insert and view images.' },
    { type: 'video', name: 'Video', icon: '🎬', description: 'Embed video or upload.' },
    { type: 'audio', name: 'Audio', icon: '🎧', description: 'Attach an audio file.' },
    { type: 'file', name: 'File', icon: '📎', description: 'Attach files for download.' },
    {
      type: 'gallery',
      name: 'Gallery',
      icon: '🖼️🖼️',
      description: 'Show multiple images in a grid.',
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
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Reminder check effect - improved to check every minute for better accuracy
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

    // Then check every minute
    const interval = setInterval(checkReminders, 60000)

    return () => clearInterval(interval)
  }, [editableContent])

  const handleAddContent = (title: string = '') => {
    const trimmedTitle = title.trim()
    if (trimmedTitle) {
      const newContent: NotionBlock = {
        id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: trimmedTitle,
        description: '',
        completed: false, // Explicitly set completed to false
        reminderEnabled: false,
        reminderTime: undefined,
        type: 'paragraph',
      }
      const updatedContent = [...editableContent, newContent]
      setEditableContent(updatedContent)
      updateEditableContent(meta.value, updatedContent as EditableContent[])

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleUpdateContent = (id: string, updatedContent: Partial<NotionBlock>) => {
    const updated = editableContent.map((content) =>
      content.id === id ? { ...content, ...updatedContent } : content
    )
    setEditableContent(updated)
    updateEditableContent(meta.value, updated as EditableContent[])
  }

  const handleToggleComplete = (id: string, completed: boolean) => {
    handleUpdateContent(id, { completed })
  }

  const handleDeleteContent = (id: string) => {
    const updated = editableContent.filter((content) => content.id !== id)
    setEditableContent(updated)
    updateEditableContent(meta.value, updated as EditableContent[])
  }

  const handleAddTodoOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement
      if (target.value.trim()) {
        handleAddContent(target.value.trim())
      }
      e.preventDefault()
    }

    if (e.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.focus()
      }
      e.preventDefault()
    }
  }

  const handleSetReminder = (id: string, minutes: number) => {
    const reminderTime = Date.now() + minutes * 60 * 1000
    handleUpdateContent(id, {
      reminderEnabled: true,
      reminderTime,
    })
  }

  // Handle media upload
  const handleMediaUpload = (id: string, file: File) => {
    // In a real implementation, you would upload the file to a server
    // For now, we'll create a local object URL
    const url = URL.createObjectURL(file)
    handleUpdateContent(id, {
      properties: {
        ...(editableContent.find((item) => item.id === id)?.properties || {}),
        mediaUrl: url,
        filename: file.name,
      },
    })
  }

  // Handle paste event for media
  const handlePaste = (e: React.ClipboardEvent, id: string) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        if (blob) {
          handleMediaUpload(id, blob)
          break
        }
      }
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: NotionBlock) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
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
    e.stopPropagation()

    if (draggedItem) {
      const draggedIndex = editableContent.findIndex((item) => item.id === draggedItem.id)

      if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
        const newContent = [...editableContent]
        const [removed] = newContent.splice(draggedIndex, 1)
        newContent.splice(dropIndex, 0, removed)
        setEditableContent(newContent)
        updateEditableContent(meta.value, newContent as EditableContent[])
      }
    }

    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const renderItem = (item: NotionBlock, index: number) => (
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
      onMediaUpload={handleMediaUpload}
      onPaste={handlePaste}
      addBlock={addBlock}
      deleteBlock={deleteBlock}
      setActiveSlashMenu={setActiveSlashMenu}
      inputRefs={inputRefs}
      items={editableContent}
    />
  )

  const HeaderTitle = () => {
    const todoItems = editableContent.filter((item) => item.type === 'to_do')
    const completedTasks = todoItems.filter((item) => item.completed).length
    const incompleteTasks = todoItems.filter((item) => !item.completed).length

    return (
      <div className="blockHeader">
        <span>{meta.label}</span>
        {todoItems.length > 0 && (
          <div className="task-count-indicator">
            {/* Incomplete tasks indicator - red circle */}
            <div className="incomplete-tasks-indicator">{incompleteTasks}</div>
            {/* Completed tasks indicator - green circle */}
            <div className="completed-tasks-indicator">{completedTasks}</div>
          </div>
        )}
      </div>
    )
  }

  // Add a new block
  const addBlock = (index: number, type: BlockType = 'paragraph') => {
    const newBlock: NotionBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: '',
      description: '',
      completed: type === 'to_do' ? false : undefined, // Only set for todo items
      reminderEnabled: false,
      reminderTime: undefined,
      properties:
        type === 'callout'
          ? { emoji: '💡' }
          : type === 'toggle'
          ? { isOpen: false }
          : type === 'code'
          ? { language: 'javascript' }
          : type === 'gallery'
          ? { images: [], layout: 'grid' }
          : type === 'image' || type === 'video' || type === 'audio' || type === 'file'
          ? { mediaUrl: undefined, caption: '' }
          : undefined,
    }

    const newContent = [...editableContent]
    newContent.splice(index + 1, 0, newBlock)
    setEditableContent(newContent)
    updateEditableContent(meta.value, newContent as EditableContent[])

    // Focus the new block after a short delay
    setTimeout(() => {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus()
      }
    }, 10)
  }

  // Delete a block
  const deleteBlock = (id: string) => {
    const updated = editableContent.filter((block) => block.id !== id)
    setEditableContent(updated)
    updateEditableContent(meta.value, updated as EditableContent[])
  }

  // Handle slash command selection
  const handleSlashCommand = (index: number, type: BlockType) => {
    if (index === -1) {
      // Special case: Adding a new block via the main input
      const newBlock: NotionBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: '',
        description: '',
        completed: type === 'to_do' ? false : undefined, // Only set for todo items
        reminderEnabled: false,
        reminderTime: undefined,
        properties:
          type === 'callout'
            ? { emoji: '💡' }
            : type === 'toggle'
            ? { isOpen: false }
            : type === 'code'
            ? { language: 'javascript' }
            : type === 'gallery'
            ? { images: [], layout: 'grid' }
            : type === 'image' || type === 'video' || type === 'audio' || type === 'file'
            ? { mediaUrl: undefined, caption: '' }
            : undefined,
      }
      
      const updatedContent = [...editableContent, newBlock]
      setEditableContent(updatedContent)
      updateEditableContent(meta.value, updatedContent as EditableContent[])
      
      // Focus the new block
      setTimeout(() => {
        if (inputRefs.current[updatedContent.length - 1]) {
          inputRefs.current[updatedContent.length - 1]?.focus()
        }
      }, 10)
    } else {
      // Regular case: Changing type of existing block
      handleUpdateContent(editableContent[index].id, { type })
      
      // Focus the block after type change
      setTimeout(() => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]?.focus()
        }
      }, 10)
    }
    
    setActiveSlashMenu(null)
  }

  // Render slash command menu
  const renderSlashMenu = () => {
    if (!activeSlashMenu) return null

    // Calculate position to ensure menu stays within viewport
    const calculatePosition = () => {
      if (!activeSlashMenu) return { x: 0, y: 0 }

      const { x, y } = activeSlashMenu.position
      const menuWidth = 280
      const menuHeight = 400
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = Math.max(10, x)
      let adjustedY = y

      // Adjust if menu would go off right edge
      if (x + menuWidth > viewportWidth) {
        adjustedX = viewportWidth - menuWidth - 10
      }

      // Adjust if menu would go off bottom edge
      if (y + menuHeight > viewportHeight) {
        // Position above the input if not enough space below
        adjustedY = y - menuHeight - 10
      }

      // Ensure menu doesn't go above viewport
      adjustedY = Math.max(10, adjustedY)

      return { x: adjustedX, y: adjustedY }
    }

    const position = calculatePosition()

    return (
      <div
        className="slash-menu"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
        }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '11px', color: '#888', padding: '8px 12px', fontWeight: 600 }}>
          BASIC BLOCKS
        </div>
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

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeSlashMenu) {
        setActiveSlashMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeSlashMenu])

  return (
    <>
      <Card titleComponent={<HeaderTitle />} {...props}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type '/' for commands, or just start typing..."
          className="add-todo-input"
          onFocus={(e) => e.target.classList.add('focused')}
          onBlur={(e) => e.target.classList.remove('focused')}
          onKeyDown={handleAddTodoOnKeyDown}
        />
        {editableContent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">Start writing</div>
            <div className="empty-state-subtext">
              Type <code className="empty-state-code">/</code> to see all block types
            </div>
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

      {renderSlashMenu()}

      {/* Media viewer modal */}
      {viewingMedia && (
        <div className="media-viewer-overlay" onClick={() => setViewingMedia(null)}>
          <div className="media-viewer-content" onClick={(e) => e.stopPropagation()}>
            {viewingMedia.type === 'image' ? (
              <img src={viewingMedia.url} alt="Full size view" className="media-viewer-image" />
            ) : viewingMedia.type === 'video' ? (
              <video src={viewingMedia.url} controls className="media-viewer-video" />
            ) : (
              <audio src={viewingMedia.url} controls className="media-viewer-audio" />
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
  item: NotionBlock
  index: number
  onUpdate: (id: string, updatedContent: Partial<NotionBlock>) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onSetReminder: (id: string, minutes: number) => void
  onDragStart: (e: React.DragEvent, item: NotionBlock) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  isDraggedOver: boolean
  onViewMedia: (media: { url: string; type: 'image' | 'video' | 'audio' }) => void
  onMediaUpload: (id: string, file: File) => void
  onPaste: (e: React.ClipboardEvent, id: string) => void
  addBlock: (index: number, type?: BlockType) => void
  deleteBlock: (id: string) => void
  setActiveSlashMenu: (menu: { index: number; position: { x: number; y: number } } | null) => void
  inputRefs: React.RefObject<(HTMLInputElement | HTMLTextAreaElement | null)[]>
  items: NotionBlock[]
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
  onMediaUpload,
  onPaste,
  addBlock,
  deleteBlock,
  setActiveSlashMenu,
  inputRefs,
  items,
}: EditableContentItemProps) => {
  const [showActions, setShowActions] = useState(false)
  const [showReminderOptions, setShowReminderOptions] = useState(false)
  // Create a separate ref for each media block
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBlockKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addBlock(index)
    }

    if (e.key === 'Backspace') {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement
      if (target.value === '') {
        e.preventDefault()
        if (items.length > 1) {
          deleteBlock(item.id)
          setTimeout(() => {
            if (inputRefs.current && inputRefs.current[index - 1]) {
              inputRefs.current[index - 1]?.focus()
            } else if (inputRefs.current && inputRefs.current[0]) {
              inputRefs.current[0]?.focus()
            }
          }, 10)
        }
      }
    }

    if (e.key === '/' && (e.target as HTMLInputElement | HTMLTextAreaElement).value === '') {
      e.preventDefault()
      const target = e.target as HTMLElement
      const rect = target.getBoundingClientRect()
      setActiveSlashMenu({
        index,
        position: { x: rect.left, y: rect.bottom + 4 },
      })
    }
  }

  const setRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (inputRefs && inputRefs.current) {
      inputRefs.current[index] = el
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files[0]) {
      onMediaUpload(id, e.target.files[0])
    }
  }

  // Trigger file input click
  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Render block based on type
  const renderBlock = () => {
    switch (item.type) {
      case 'heading1':
        return (
          <input
            ref={setRef}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            placeholder="Heading 1"
            className="heading1-input"
          />
        )
      case 'heading2':
        return (
          <input
            ref={setRef}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            placeholder="Heading 2"
            className="heading2-input"
          />
        )
      case 'heading3':
        return (
          <input
            ref={setRef}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            placeholder="Heading 3"
            className="heading3-input"
          />
        )
      case 'bulleted_list':
        return (
          <div className="list-block">
            <span className="list-bullet">•</span>
            <input
              ref={setRef}
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              placeholder="List item"
              className="list-input"
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
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              placeholder="List item"
              className="list-input"
            />
          </div>
        )
      case 'toggle':
        return (
          <div>
            <div className="list-block">
              <button
                onClick={() =>
                  onUpdate(item.id, {
                    properties: { ...item.properties, isOpen: !item.properties?.isOpen },
                  })
                }
                className="toggle-button">
                {item.properties?.isOpen ? '▼' : '▶'}
              </button>
              <input
                ref={setRef}
                type="text"
                value={item.title}
                onChange={(e) => onUpdate(item.id, { title: e.target.value })}
                onKeyDown={handleBlockKeyDown}
                placeholder="Toggle"
                className="list-input"
                style={{ fontWeight: 500 }}
              />
            </div>
            {item.properties?.isOpen && (
              <div className="toggle-content">
                <textarea
                  value={item.description || ''}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  placeholder="Toggle content..."
                  className="todo-description-textarea"
                  style={{ minHeight: '60px' }}
                />
              </div>
            )}
          </div>
        )
      case 'quote':
        return (
          <div className="quote-block">
            <div className="quote-bar"></div>
            <input
              ref={setRef}
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              placeholder="Quote"
              className="quote-input"
            />
          </div>
        )
      case 'callout':
        return (
          <div className="callout-block">
            <input
              type="text"
              value={item.properties?.emoji || '💡'}
              onChange={(e) =>
                onUpdate(item.id, {
                  properties: { ...item.properties, emoji: e.target.value },
                })
              }
              className="callout-emoji"
              maxLength={2}
            />
            <input
              ref={setRef}
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              placeholder="Callout text"
              className="callout-input"
            />
          </div>
        )
      case 'code':
        return (
          <div className="code-block">
            <div className="code-header">
              <select
                value={item.properties?.language || 'javascript'}
                onChange={(e) =>
                  onUpdate(item.id, {
                    properties: { ...item.properties, language: e.target.value },
                  })
                }
                className="code-language-select">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <textarea
              ref={setRef as any}
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onKeyDown={(e) => {
                // Prevent adding new block when pressing Enter in textarea
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                }
                // Pass other key events to the main handler
                handleBlockKeyDown(e as any)
              }}
              placeholder="Code block"
              className="code-textarea"
            />
          </div>
        )
      case 'divider':
        return (
          <div className="divider-block">
            <div className="divider-line"></div>
          </div>
        )
      case 'to_do':
        return (
          <div className="list-block">
            <input
              type="checkbox"
              checked={!!item.completed}
              onChange={(e) => onToggleComplete(item.id, e.target.checked)}
              className="todo-checkbox"
            />
            <input
              ref={setRef}
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, { title: e.target.value })}
              onKeyDown={handleBlockKeyDown}
              placeholder="To-do"
              className={`todo-title-input ${item.completed ? 'completed' : ''}`}
            />
          </div>
        )
      case 'image':
        return (
          <div className="media-block image-block">
            {item.properties?.mediaUrl ? (
              <div>
                <img
                  src={item.properties.mediaUrl}
                  alt={item.properties.caption || 'Uploaded image'}
                  className="media-preview"
                  onClick={() => onViewMedia({ url: item.properties!.mediaUrl!, type: 'image' })}
                />
                <input
                  ref={setRef}
                  type="text"
                  value={item.properties.caption || ''}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      properties: { ...item.properties, caption: e.target.value },
                    })
                  }
                  onKeyDown={handleBlockKeyDown}
                  placeholder="Add a caption"
                  className="media-caption"
                />
              </div>
            ) : (
              <div className="media-upload-placeholder" onClick={triggerFileInput}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, item.id)}
                  className="media-file-input"
                />
                <div className="media-upload-text">Click to upload an image</div>
              </div>
            )}
          </div>
        )
      case 'video':
        return (
          <div className="media-block video-block">
            {item.properties?.mediaUrl ? (
              <div>
                <video
                  src={item.properties.mediaUrl}
                  controls
                  className="media-preview"
                  onClick={() => onViewMedia({ url: item.properties!.mediaUrl!, type: 'video' })}
                />
                <input
                  ref={setRef}
                  type="text"
                  value={item.properties.caption || ''}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      properties: { ...item.properties, caption: e.target.value },
                    })
                  }
                  onKeyDown={handleBlockKeyDown}
                  placeholder="Add a caption"
                  className="media-caption"
                />
              </div>
            ) : (
              <div className="media-upload-placeholder" onClick={triggerFileInput}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, item.id)}
                  className="media-file-input"
                />
                <div className="media-upload-text">Click to upload a video</div>
              </div>
            )}
          </div>
        )
      case 'audio':
        return (
          <div className="media-block audio-block">
            {item.properties?.mediaUrl ? (
              <div>
                <audio
                  src={item.properties.mediaUrl}
                  controls
                  className="media-preview"
                  onClick={() => onViewMedia({ url: item.properties!.mediaUrl!, type: 'audio' })}
                />
                <input
                  ref={setRef}
                  type="text"
                  value={item.properties.caption || ''}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      properties: { ...item.properties, caption: e.target.value },
                    })
                  }
                  onKeyDown={handleBlockKeyDown}
                  placeholder="Add a caption"
                  className="media-caption"
                />
              </div>
            ) : (
              <div className="media-upload-placeholder" onClick={triggerFileInput}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, item.id)}
                  className="media-file-input"
                />
                <div className="media-upload-text">Click to upload an audio file</div>
              </div>
            )}
          </div>
        )
      case 'file':
        return (
          <div className="media-block file-block">
            {item.properties?.mediaUrl ? (
              <div className="file-preview">
                <div className="file-icon">📎</div>
                <div className="file-info">
                  <div className="file-name">{item.properties.filename || 'Download file'}</div>
                  <input
                    ref={setRef}
                    type="text"
                    value={item.properties.caption || ''}
                    onChange={(e) =>
                      onUpdate(item.id, {
                        properties: { ...item.properties, caption: e.target.value },
                      })
                    }
                    onKeyDown={handleBlockKeyDown}
                    placeholder="Add a caption"
                    className="media-caption"
                  />
                </div>
              </div>
            ) : (
              <div className="media-upload-placeholder" onClick={triggerFileInput}>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileChange(e, item.id)}
                  className="media-file-input"
                />
                <div className="media-upload-text">Click to upload a file</div>
              </div>
            )}
          </div>
        )
      case 'gallery':
        return (
          <div className="media-block gallery-block">
            <div className="gallery-layout">
              {item.properties?.images?.map((imageUrl, imgIndex) => (
                <img
                  key={imgIndex}
                  src={imageUrl}
                  alt={`Gallery image ${imgIndex + 1}`}
                  className="gallery-image"
                  onClick={() => onViewMedia({ url: imageUrl, type: 'image' })}
                />
              ))}
              <div className="gallery-upload-placeholder" onClick={triggerFileInput}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const urls = Array.from(e.target.files).map((file) =>
                        URL.createObjectURL(file)
                      )
                      onUpdate(item.id, {
                        properties: {
                          ...item.properties,
                          images: [...(item.properties?.images || []), ...urls],
                        },
                      })
                    }
                  }}
                  className="media-file-input"
                />
                <div className="media-upload-text">+ Add images</div>
              </div>
            </div>
          </div>
        )
      case 'paragraph':
      default:
        return (
          <input
            ref={setRef}
            type="text"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
            onKeyDown={handleBlockKeyDown}
            onPaste={(e) => onPaste(e, item.id)}
            placeholder="Type '/' for commands"
            className="paragraph-input"
          />
        )
    }
  }

  return (
    <div
      className={`editable-content-item ${isDraggedOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      <div className="todo-content">
        {/* Drag handle */}
        <div className="drag-handle" title="Drag to reorder">
          ⋮⋮
        </div>

        {/* Block content */}
        <div className="todo-main-content">{renderBlock()}</div>

        {/* Action buttons */}
        <div className={`content-item-actions ${showActions ? 'visible' : ''}`}>
          {item.type === 'to_do' && (
            <button
              className={`reminder-button ${item.reminderEnabled ? 'active' : ''}`}
              onClick={() => setShowReminderOptions(!showReminderOptions)}
              title={item.reminderEnabled ? 'Reminder set' : 'Set reminder'}>
              ⏰
            </button>
          )}

          <button className="delete-button" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>

      {/* Reminder options */}
      {showReminderOptions && (
        <div className="reminder-options">
          {[
            { label: '1 min', value: 1 },
            { label: '5 min', value: 5 },
            { label: '10 min', value: 10 },
            { label: '30 min', value: 30 },
            { label: '1 hour', value: 60 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSetReminder(item.id, option.value)
                setShowReminderOptions(false)
              }}>
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Reminder info */}
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
