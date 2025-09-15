import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUserPreferences } from 'src/stores/preferences'
import { Article } from 'src/types'
import ArticleItem from './ArticleItem'

type SortableArticleItemProps = {
  item: Article
  index: number
  analyticsTag: string
}

export const SortableArticleItem = ({ item, index, analyticsTag }: SortableArticleItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const { isOrganizeMode } = useUserPreferences()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative' as const,
  }

  return (
    <div ref={setNodeRef} style={style} className="sortable-article-item">
      {isOrganizeMode && <button className="article-drag-handle" {...attributes} {...listeners} />}
      <div style={{ pointerEvents: isOrganizeMode ? 'none' : 'auto' }}>
        <ArticleItem
          item={item}
          index={index}
          analyticsTag={analyticsTag}
          selectedTag={undefined}
        />
      </div>
    </div>
  )
}
