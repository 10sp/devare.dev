import { useEffect, useState } from 'react'
import { Modal } from 'src/components/Elements'
import { getRssUrlFeed } from 'src/features/cards'
import { trackRssSourceAdd } from 'src/lib/analytics'
import { useUserPreferences } from 'src/stores/preferences'
import { SupportedCardType } from 'src/types'
import { detectRssFeeds, validateRssFeed } from '../api/detectRssFeeds'
import './rssFinderModal.css'

type RssFeed = {
  url: string
  title: string
  type: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  urlToCheck?: string
}

export const RssFinderModal = ({ isOpen, onClose, urlToCheck }: Props) => {
  const [url, setUrl] = useState(urlToCheck || '')
  const [isLoading, setIsLoading] = useState(false)
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [validatedFeeds, setValidatedFeeds] = useState<Record<string, boolean>>({})
  const [selectedFeeds, setSelectedFeeds] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const { userCustomCards, setUserCustomCards, cards, setCards } = useUserPreferences()

  useEffect(() => {
    if (urlToCheck) {
      setUrl(urlToCheck)
      handleDetectFeeds(urlToCheck)
    }
  }, [urlToCheck])

  const handleDetectFeeds = async (inputUrl: string) => {
    if (!inputUrl) {
      setError('Please enter a URL')
      return
    }

    // Add protocol if missing
    if (!inputUrl.startsWith('http')) {
      inputUrl = 'https://' + inputUrl
    }

    try {
      setIsLoading(true)
      setError(null)
      setFeeds([])
      setValidatedFeeds({})
      setSelectedFeeds({})

      // Validate URL format
      new URL(inputUrl)

      const detectedFeeds = await detectRssFeeds(inputUrl)

      if (detectedFeeds.length === 0) {
        setError('No RSS feeds found on this website')
        return
      }

      setFeeds(detectedFeeds)

      // Validate each feed
      const validationResults: Record<string, boolean> = {}
      for (const feed of detectedFeeds) {
        try {
          const isValid = await validateRssFeed(feed.url)
          validationResults[feed.url] = isValid
        } catch (e) {
          validationResults[feed.url] = false
        }
      }

      setValidatedFeeds(validationResults)

      // Select all valid feeds by default
      const initialSelection: Record<string, boolean> = {}
      detectedFeeds.forEach((feed) => {
        initialSelection[feed.url] = validationResults[feed.url] || false
      })
      setSelectedFeeds(initialSelection)
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSelectedFeeds = async () => {
    try {
      const feedsToAdd = feeds.filter((feed) => selectedFeeds[feed.url])

      if (feedsToAdd.length === 0) {
        setError('Please select at least one feed to add')
        return
      }

      setIsLoading(true)

      // Process each selected feed
      const newCustomCards: SupportedCardType[] = []

      for (const feed of feedsToAdd) {
        try {
          // Get feed information
          const feedInfo = await getRssUrlFeed(feed.url)

          const customCard: SupportedCardType = {
            feedUrl: feed.url,
            label: feedInfo.title || feed.title,
            value: feedInfo.title.toLowerCase().replace(/\s+/g, '-') || `rss-${Date.now()}`,
            analyticsTag: feedInfo.title.toLowerCase().replace(/\s+/g, '-') || `rss-${Date.now()}`,
            link: feedInfo.link || feed.url,
            type: 'rss',
            icon: feedInfo.icon || '📰',
          }

          newCustomCards.push(customCard)
          trackRssSourceAdd(customCard.value)
        } catch (err) {
          console.error(`Error processing feed ${feed.url}:`, err)
          // Continue with other feeds even if one fails
        }
      }

      // Update user preferences
      if (newCustomCards.length > 0) {
        setUserCustomCards([...userCustomCards, ...newCustomCards])

        // Add new cards to the cards list
        const newCards = newCustomCards.map((card, index) => ({
          id: cards.length + index,
          name: card.value,
          type: 'rss' as const,
        }))

        setCards([...cards, ...newCards])
      }

      // Close modal and show success
      onClose()

      // Show success message (you might want to implement this with a toast notification)
      alert(`Successfully added ${newCustomCards.length} RSS feed(s)!`)
    } catch (err) {
      setError('Error adding RSS feeds. Please try again.')
      console.error('Error adding RSS feeds:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFeedSelection = (feedUrl: string) => {
    setSelectedFeeds((prev) => ({
      ...prev,
      [feedUrl]: !prev[feedUrl],
    }))
  }

  return (
    <Modal showModal={isOpen} onClose={onClose} header={{ title: 'RSS Feed Finder' }}>
      <div className="rss-finder-modal">
        <div className="rss-finder-form">
          <div className="form-group">
            <label htmlFor="website-url">Website URL</label>
            <div className="input-group">
              <input
                id="website-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
              <button
                onClick={() => handleDetectFeeds(url)}
                disabled={isLoading || !url}
                className="detect-button">
                {isLoading ? 'Detecting...' : 'Find Feeds'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {feeds.length > 0 && (
            <div className="feeds-list">
              <h3>Found {feeds.length} RSS Feed(s)</h3>
              <div className="feeds-container">
                {feeds.map((feed, index) => (
                  <div
                    key={feed.url}
                    className={`feed-item ${selectedFeeds[feed.url] ? 'selected' : ''}`}>
                    <div className="feed-header">
                      <input
                        type="checkbox"
                        checked={selectedFeeds[feed.url] || false}
                        onChange={() => toggleFeedSelection(feed.url)}
                        disabled={!validatedFeeds[feed.url]}
                      />
                      <div className="feed-info">
                        <h4>{feed.title}</h4>
                        <p className="feed-url">{feed.url}</p>
                      </div>
                    </div>
                    <div className="feed-status">
                      {validatedFeeds[feed.url] === true && (
                        <span className="status valid">✓ Valid</span>
                      )}
                      {validatedFeeds[feed.url] === false && (
                        <span className="status invalid">✗ Invalid</span>
                      )}
                      {validatedFeeds[feed.url] === undefined && (
                        <span className="status checking">Checking...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  onClick={handleAddSelectedFeeds}
                  disabled={isLoading || Object.values(selectedFeeds).filter(Boolean).length === 0}
                  className="add-feeds-button">
                  {isLoading ? 'Adding...' : `Add Selected Feed(s)`}
                </button>
                <button onClick={onClose} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
