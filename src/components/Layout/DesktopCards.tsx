import { useEffect, useMemo, useRef } from 'react'
//import SortableList, { SortableItem } from 'react-easy-sort'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import { MdOutlineDragIndicator } from 'react-icons/md'
import { SUPPORTED_CARDS } from 'src/config/supportedCards'
import { CustomRssCard } from 'src/features/cards'
import { useRemoteConfigStore } from 'src/features/remoteConfig'
import { trackPageDrag } from 'src/lib/analytics'
import { DesktopBreakpoint } from 'src/providers/DesktopBreakpoint'
import { useUserPreferences } from 'src/stores/preferences'
import { SelectedCard, SupportedCardType } from 'src/types'

type SortableItemProps = {
  id: string
  card: SupportedCardType
}

const SortableItem = ({ id, card }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging, transform, transition } = useSortable({
    id,
  })
  const { isOrganizeMode } = useUserPreferences()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Component = card.component || CustomRssCard

  return (
    <div ref={setNodeRef} style={style} className={clsx(isOrganizeMode && 'grid-item')}>
      <Component
        meta={card}
        className={clsx(isDragging && 'draggedBlock', isOrganizeMode && 'organize-item')}
        knob={
          <DesktopBreakpoint>
            <button className="blockHeaderDragButton" {...attributes} {...listeners}>
              <MdOutlineDragIndicator />
            </button>
          </DesktopBreakpoint>
        }
      />
    </div>
  )
}

export const DesktopCards = ({
  cards,
  userCustomCards,
}: {
  cards: SelectedCard[]
  userCustomCards: SupportedCardType[]
}) => {
  const AVAILABLE_CARDS = [...SUPPORTED_CARDS, ...userCustomCards]
  const { updateCardOrder, isOrganizeMode, setIsOrganizeMode, setCards } = useUserPreferences()
  const cardsWrapperRef = useRef<HTMLDivElement>(null)
  const { adsConfig } = useRemoteConfigStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = () => {
    cardsWrapperRef.current?.classList.add('snapDisabled')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      // Find the indices of the dragged items in the cards array
      const oldIndex = cards.findIndex((card) => card.name === active.id)
      const newIndex = cards.findIndex((card) => card.name === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the card order using the store action
        updateCardOrder(oldIndex, newIndex)
        trackPageDrag()
      }
    }

    cardsWrapperRef.current?.classList.remove('snapDisabled')
  }

  // Custom auto-scroll function
  const handleDragMove = (event: any) => {
    if (!cardsWrapperRef.current) return

    const container = cardsWrapperRef.current
    const { clientX } = event
    const { left, right, width } = container.getBoundingClientRect()

    // Calculate edge thresholds (10% of container width)
    const threshold = width * 0.1
    const leftEdge = left + threshold
    const rightEdge = right - threshold

    // Scroll speed based on distance from edge
    const scrollSpeed = 10

    if (clientX < leftEdge) {
      // Scroll left
      const intensity = (leftEdge - clientX) / threshold
      container.scrollBy({ left: -scrollSpeed * intensity, behavior: 'smooth' })
    } else if (clientX > rightEdge) {
      // Scroll right
      const intensity = (clientX - rightEdge) / threshold
      container.scrollBy({ left: scrollSpeed * intensity, behavior: 'smooth' })
    }
  }

  const memoCards = useMemo(() => {
    return cards
      .map((card) => {
        const constantCard = AVAILABLE_CARDS.find((c) => c.value === card.name)
        if (!constantCard) {
          return null
        }

        return {
          card: constantCard,
          id: card.name, // Use card name as ID instead of card.id
        }
      })
      .filter(Boolean) as { id: string; card: SupportedCardType }[]
  }, [cards])

  // Exit organize mode when pressing ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOrganizeMode) {
        setIsOrganizeMode(false)
        document.documentElement.classList.remove('organizeMode')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOrganizeMode, setIsOrganizeMode])

  // Handle exit organize mode
  const handleExitOrganizeMode = () => {
    setIsOrganizeMode(false)
    document.documentElement.classList.remove('organizeMode')
  }

  return (
    <div
      ref={cardsWrapperRef}
      className={clsx('Cards', 'HorizontalScroll', isOrganizeMode && 'grid-layout')}>
      {isOrganizeMode && (
        <div className="organize-mode-header">
          <h2>Organize Cards</h2>
          <p>Drag and drop cards to reorder them. Press ESC to exit.</p>
          <button className="exit-organize-mode" onClick={handleExitOrganizeMode}>
            Exit Organize Mode
          </button>
        </div>
      )}
      <DndContext
        sensors={sensors}
        autoScroll={true}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}>
        <SortableContext
          items={memoCards.map(({ id }) => id)}
          strategy={horizontalListSortingStrategy}>
          {memoCards.map(({ id, card }, index) => {
            return <SortableItem key={id} id={id} card={card} />
          })}
        </SortableContext>
      </DndContext>
    </div>
  )
}
