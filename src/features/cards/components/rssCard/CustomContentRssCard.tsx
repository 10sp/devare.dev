import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { Card } from 'src/components/Elements'
import { ListComponent } from 'src/components/List'
import { SortableArticleItem } from 'src/features/cards/components/rssCard/SortableArticleItem'
import { useUserPreferences } from 'src/stores/preferences'
import { Article, CardPropsType } from 'src/types'
import CardIcon from './CardIcon'
import './rssCard.css'

export function CustomContentRssCard(props: CardPropsType) {
  const { meta } = props
  const { userCustomCards, updateUserCustomCards } = useUserPreferences()

  // Use custom content if available
  const customContent = meta.customContent as Article[] | undefined

  // State for managing article order
  const [articles, setArticles] = useState<Article[]>([])

  // Initialize articles from custom content
  useEffect(() => {
    if (customContent) {
      setArticles(customContent)
    }
  }, [customContent])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = articles.findIndex((item) => item.id === active.id)
      const newIndex = articles.findIndex((item) => item.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newArticles = arrayMove(articles, oldIndex, newIndex)
        setArticles(newArticles)

        // Update the user preferences with the new order
        const updatedCards = userCustomCards.map((card) =>
          card.value === meta.value ? { ...card, customContent: newArticles } : card
        )
        updateUserCustomCards(updatedCards)
      }
    }
  }

  const renderItem = (item: Article, index: number) => (
    <SortableArticleItem item={item} key={item.id} index={index} analyticsTag={meta.analyticsTag} />
  )

  const HeaderTitle = () => {
    return (
      <>
        <p className="maxTitle"> {meta.label} </p>
      </>
    )
  }

  return (
    <Card
      titleComponent={<HeaderTitle />}
      {...props}
      meta={{ ...meta, icon: <CardIcon url={meta.icon as string} /> }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={articles.map((item) => item.id)}
          strategy={verticalListSortingStrategy}>
          <ListComponent items={articles} isLoading={false} renderItem={renderItem} />
        </SortableContext>
      </DndContext>
    </Card>
  )
}
