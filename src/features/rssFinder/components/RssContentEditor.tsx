import { useEffect, useState } from 'react'
import { Modal } from 'src/components/Elements'
import { CustomContentRssCard } from 'src/features/cards/components/rssCard/CustomContentRssCard'
import { useUserPreferences } from 'src/stores/preferences'
import { Article, BaseEntry, SupportedCardType } from 'src/types'
import './rssContentEditor.css'

type RssFeed = {
  url: string
  title: string
  type: string
}

type RssArticle = BaseEntry & {
  title: string
  url: string
  published_at: string
  description: string
  author?: string
  tags?: string[]
  image?: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  feed: RssFeed
  existingCard?: SupportedCardType
}

export const RssContentEditor = ({ isOpen, onClose, feed, existingCard }: Props) => {
  const [articles, setArticles] = useState<RssArticle[]>([])
  const [selectedArticles, setSelectedArticles] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { userCustomCards, setUserCustomCards, cards, setCards } = useUserPreferences()

  // Fetch articles from the RSS feed
  useEffect(() => {
    if (isOpen && feed.url) {
      fetchRssArticles()
    }
  }, [isOpen, feed.url])

  // Initialize selected articles when editing an existing card
  useEffect(() => {
    if (existingCard && existingCard.customContent && articles.length > 0) {
      // Create a map of article URLs to indices for quick lookup
      const articleUrlToIndex: Record<string, number> = {}
      articles.forEach((article, index) => {
        articleUrlToIndex[article.url] = index
      })

      // Initialize selection based on existing custom content
      const initialSelection: Record<string, boolean> = {}
      existingCard.customContent.forEach((article) => {
        const index = articleUrlToIndex[article.url]
        if (index !== undefined) {
          initialSelection[index.toString()] = true
        }
      })

      setSelectedArticles(initialSelection)
    }
  }, [existingCard, articles])

  const fetchRssArticles = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch actual RSS feed content
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.status !== 'ok') {
        throw new Error(`RSS feed error: ${data.message}`)
      }

      // Transform RSS items to our Article format
      const rssArticles: RssArticle[] = data.items.map((item: any, index: number) => {
        // Extract image URL from enclosure or media fields if available
        let imageUrl = ''
        if (item.enclosure && item.enclosure.link) {
          imageUrl = item.enclosure.link
        } else if (item.media && item.media.content && item.media.content.url) {
          imageUrl = item.media.content.url
        } else if (item.thumbnail) {
          imageUrl = item.thumbnail
        }

        return {
          id: `rss-${index}`,
          title: item.title,
          url: item.link,
          published_at: item.pubDate,
          description: item.description || item.contentSnippet || '',
          author: item.author,
          tags: item.categories || [],
          image: imageUrl,
        }
      })

      setArticles(rssArticles)

      // Initialize selection based on existing card or default to all selected
      const initialSelection: Record<string, boolean> = {}
      if (existingCard && existingCard.customContent) {
        // When editing, select only the articles that were previously selected
        const articleUrlToIndex: Record<string, number> = {}
        rssArticles.forEach((article, index) => {
          articleUrlToIndex[article.url] = index
        })

        existingCard.customContent.forEach((article) => {
          const index = articleUrlToIndex[article.url]
          if (index !== undefined) {
            initialSelection[index.toString()] = true
          }
        })
      } else {
        // When creating new, select all articles by default
        rssArticles.forEach((_, index) => {
          initialSelection[index.toString()] = true
        })
      }
      setSelectedArticles(initialSelection)
    } catch (err) {
      setError(
        `Failed to fetch RSS articles: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      console.error('Error fetching RSS articles:', err)

      // Fallback to sample data if fetch fails
      const sampleArticles: RssArticle[] = [
        {
          id: 'sample-1',
          title: 'Sample Article 1',
          url: 'https://example.com/article1',
          published_at: new Date().toISOString(),
          description: 'This is a sample article description',
          author: 'Author 1',
          tags: ['tech', 'programming'],
          image: '',
        },
        {
          id: 'sample-2',
          title: 'Sample Article 2',
          url: 'https://example.com/article2',
          published_at: new Date(Date.now() - 86400000).toISOString(),
          description: 'This is another sample article description',
          author: 'Author 2',
          tags: ['web', 'design'],
          image: '',
        },
      ]

      setArticles(sampleArticles)

      // Initialize selection based on existing card or default to all selected
      const initialSelection: Record<string, boolean> = {}
      if (existingCard && existingCard.customContent) {
        // When editing, select only the articles that were previously selected
        // For sample data, we'll just select the first article as an example
        initialSelection['0'] = true
      } else {
        // When creating new, select all articles by default
        sampleArticles.forEach((_, index) => {
          initialSelection[index.toString()] = true
        })
      }
      setSelectedArticles(initialSelection)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleArticleSelection = (index: string) => {
    setSelectedArticles((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleCreateCustomCard = () => {
    try {
      // Get selected articles
      const selected = Object.entries(selectedArticles)
        .filter(([_, isSelected]) => isSelected)
        .map(([index]) => articles[parseInt(index)])

      if (selected.length === 0) {
        setError('Please select at least one article')
        return
      }

      // Transform RssArticle to Article format
      const transformedArticles: Article[] = selected.map((article, index) => ({
        id: article.id,
        url: article.url,
        title: article.title,
        published_at: new Date(article.published_at).getTime(),
        tags: article.tags || [],
        reactions: 0,
        comments: 0,
        image_url: article.image || '',
        source: 'custom',
      }))

      if (existingCard) {
        // Update existing card
        const updatedCard: SupportedCardType = {
          ...existingCard,
          customContent: transformedArticles,
          component: CustomContentRssCard,
        }

        // Update user preferences
        const updatedUserCards = userCustomCards.map((card) =>
          card.value === existingCard.value ? updatedCard : card
        )
        setUserCustomCards(updatedUserCards)

        // Close modal and show success
        onClose()
        alert(`Successfully updated custom card with ${selected.length} article(s)!`)
      } else {
        // Create a new custom card with the selected articles
        const customCard: SupportedCardType = {
          feedUrl: feed.url,
          label: `${feed.title} - Custom`,
          value: `custom-rss-${Date.now()}`,
          analyticsTag: `custom-rss-${Date.now()}`,
          link: feed.url,
          type: 'rss',
          icon: '📰',
          customContent: transformedArticles, // Store the selected articles as custom content
          component: CustomContentRssCard,
        }

        // Update user preferences
        setUserCustomCards([...userCustomCards, customCard])

        // Add new card to the cards list
        const newCard = {
          id: cards.length,
          name: customCard.value,
          type: 'rss' as const,
        }

        setCards([...cards, newCard])

        // Close modal and show success
        onClose()
        alert(`Successfully created custom card with ${selected.length} article(s)!`)
      }
    } catch (err) {
      setError('Error creating custom card. Please try again.')
      console.error('Error creating custom card:', err)
    }
  }

  return (
    <Modal
      showModal={isOpen}
      onClose={onClose}
      header={{ title: existingCard ? 'Edit RSS Content' : 'RSS Content Editor' }}>
      <div className="rss-content-editor">
        <div className="feed-info">
          <h3>{feed.title}</h3>
          <p>{feed.url}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading articles...</div>
        ) : (
          <div className="articles-list">
            <h4>
              {existingCard ? 'Edit Articles for Custom Card' : 'Select Articles for Custom Card'}
            </h4>
            <div className="articles-container">
              {articles.map((article, index) => (
                <div
                  key={index}
                  className={`article-item ${
                    selectedArticles[index.toString()] ? 'selected' : ''
                  }`}>
                  <div className="article-header">
                    <input
                      type="checkbox"
                      checked={selectedArticles[index.toString()] || false}
                      onChange={() => toggleArticleSelection(index.toString())}
                    />
                    <div className="article-info">
                      <h5>{article.title}</h5>
                      <p className="article-url">{article.url}</p>
                      <p className="article-description">{article.description}</p>
                      {article.author && <p className="article-author">By {article.author}</p>}
                      {article.tags && (
                        <div className="article-tags">
                          {article.tags.map((tag: string, tagIndex: number) => (
                            <span key={tagIndex} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={handleCreateCustomCard}
                disabled={Object.values(selectedArticles).filter(Boolean).length === 0}
                className="create-card-button">
                {existingCard ? 'Update Card' : 'Create Custom Card'}
              </button>
              <button onClick={onClose} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
