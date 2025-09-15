import clsx from 'clsx'
import { useEffect, useLayoutEffect, useState } from 'react'
import { DNDLayout } from 'src/components/Layout'
import { setupAnalytics, setupIdentification, trackPageView } from 'src/lib/analytics'
import { useUserPreferences } from 'src/stores/preferences'
import { AppContentLayout } from './components/Layout'
import { isWebOrExtensionVersion } from './utils/Environment'
import { lazyImport } from './utils/lazyImport'
const { OnboardingModal } = lazyImport(() => import('src/features/onboarding'), 'OnboardingModal')

const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      document.documentElement.classList.remove('dndState')
    } else {
      document.documentElement.classList.add('dndState')
    }
  })
}

export const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const {
    onboardingCompleted,
    maxVisibleCards,
    isDNDModeActive,
    layout,
    DNDDuration,
    setDNDDuration,
    isOrganizeMode,
    userCustomCards,
    setUserCustomCards,
    cards,
    setCards,
  } = useUserPreferences()

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--max-visible-cards', maxVisibleCards.toString())
  }, [maxVisibleCards])

  useEffect(() => {
    document.body.classList.remove('preload')
    setupAnalytics()
    setupIdentification()
  }, [])

  useEffect(() => {
    // Check for RSS feeds to add (for browser extension)
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime
        .sendMessage({ type: 'GET_RSS_FEEDS_TO_ADD' })
        .then((response) => {
          if (response && response.feeds && response.feeds.length > 0) {
            handleAddRssFeeds(response.feeds)
          }
        })
        .catch((error) => {
          console.log('Not running in extension context or no feeds to add')
        })
    }
  }, [])

  const handleAddRssFeeds = async (feeds: Array<{ url: string; title: string; type: string }>) => {
    try {
      // Import the getRssUrlFeed function dynamically to avoid circular dependencies
      const { getRssUrlFeed } = await import('src/features/cards')

      // Process each feed
      const newCustomCards = []
      const newCards = []

      for (const feed of feeds) {
        try {
          // Get feed information
          const feedInfo = await getRssUrlFeed(feed.url)

          const customCard = {
            feedUrl: feed.url,
            label: feedInfo.title || feed.title,
            value: feedInfo.title.toLowerCase().replace(/\s+/g, '-') || `rss-${Date.now()}`,
            analyticsTag: feedInfo.title.toLowerCase().replace(/\s+/g, '-') || `rss-${Date.now()}`,
            link: feedInfo.link || feed.url,
            type: 'rss',
            icon: feedInfo.icon || '📰',
          }

          newCustomCards.push(customCard)

          // Add to cards list
          newCards.push({
            id: cards.length + newCards.length,
            name: customCard.value,
            type: 'rss' as const,
          })
        } catch (err) {
          console.error(`Error processing feed ${feed.url}:`, err)
        }
      }

      // Update user preferences
      if (newCustomCards.length > 0) {
        setUserCustomCards([...userCustomCards, ...(newCustomCards as any)])
        setCards([...cards, ...newCards])

        // Show success message
        alert(`Successfully added ${newCustomCards.length} RSS feed(s)!`)
      }
    } catch (err) {
      console.error('Error adding RSS feeds:', err)
    }
  }

  useEffect(() => {
    trackPageView('home', isDNDModeActive())
    if (!isDNDModeActive() && DNDDuration !== 'never') {
      setDNDDuration('never')
    }
  }, [DNDDuration, isDNDModeActive, setDNDDuration])

  useLayoutEffect(() => {
    let dndContent = document.querySelector('.DNDContent')
    let observer = new IntersectionObserver(intersectionCallback, {
      threshold: 0.1,
    })

    if (dndContent) {
      observer.observe(dndContent)
    } else {
      document.documentElement.classList.remove('dndState')
    }

    return () => {
      observer.disconnect()
    }
  }, [DNDDuration])

  return (
    <>
      {!onboardingCompleted && isWebOrExtensionVersion() === 'extension' && (
        <OnboardingModal showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />
      )}

      <div
        className={clsx(
          'layoutLayers hideScrollBar',
          layout === 'cards' ? 'cardsLayout' : 'gridLayout',
          isOrganizeMode && 'organizeMode'
        )}>
        {isDNDModeActive() && <DNDLayout />}
        <AppContentLayout />
      </div>
    </>
  )
}
