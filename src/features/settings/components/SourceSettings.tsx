import { useMemo, useRef, useState } from 'react'
import { BiExport, BiImport } from 'react-icons/bi'
import { Button, ChipsSet, ConfirmModal } from 'src/components/Elements'
import { SettingsContentLayout } from 'src/components/Layout/SettingsContentLayout/SettingsContentLayout'
import { SUPPORTED_CARDS } from 'src/config/supportedCards'
import { RssContentEditor, RssFinderModal } from 'src/features/rssFinder'
import { trackSourceAdd, trackSourceRemove } from 'src/lib/analytics'
import { useUserPreferences } from 'src/stores/preferences'
import { Option, SelectedCard, SupportedCardType } from 'src/types'
import { RssSetting } from './RssSetting'
import './sourceSettings.css'

export const SourceSettings = () => {
  const { cards, setCards, userCustomCards, setUserCustomCards } = useUserPreferences()
  const [confirmDelete, setConfirmDelete] = useState<{
    showModal: boolean
    option?: Option
  }>({
    showModal: false,
    option: undefined,
  })
  const [showRssFinder, setShowRssFinder] = useState(false)
  const [showRssEditor, setShowRssEditor] = useState(false)
  const [selectedCardForEditing, setSelectedCardForEditing] = useState<SupportedCardType | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mergedSources = useMemo(() => {
    return [
      ...SUPPORTED_CARDS.map((source) => {
        return {
          label: source.label,
          value: source.value,
          icon: source.icon,
          // All sources can be removed now, not just custom ones
          removeable: true,
        }
      }),
      ...userCustomCards.map((source) => {
        return {
          label: source.label,
          value: source.value,
          removeable: true,
          icon: source.icon ? <img src={source.icon as string} alt="" /> : undefined,
          // Add edit action for custom RSS cards
          actions: [
            {
              label: 'Edit Content',
              onClick: () => handleEditRssCard(source),
            },
          ],
        }
      }),
    ].sort((a, b) => (a.label > b.label ? 1 : -1))
  }, [userCustomCards])

  // Export sources configuration
  const handleExport = () => {
    const exportData = {
      cards: cards,
      userCustomCards: userCustomCards,
      exportDate: new Date().toISOString(),
      version: '1.0',
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `devare-sources-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import sources configuration
  const handleImport = () => {
    fileInputRef.current?.click()
  }

  // Handle file upload for import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        // Validate import data
        if (!importData.cards || !importData.userCustomCards) {
          throw new Error('Invalid file format')
        }

        // Set the imported data
        setCards(importData.cards)
        setUserCustomCards(importData.userCustomCards)

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        alert('Sources imported successfully!')
      } catch (error) {
        console.error('Error importing sources:', error)
        alert('Error importing sources. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  // Open RSS content editor for a specific card
  const handleEditRssCard = (card: SupportedCardType) => {
    setSelectedCardForEditing(card)
    setShowRssEditor(true)
  }

  return (
    <SettingsContentLayout
      title="Sources"
      description={`Your feed will be tailored by following the sources you are interested in.`}>
      <>
        <div className="sources-actions">
          <Button startIcon={<BiImport />} onClick={handleImport}>
            Import Sources
          </Button>
          <Button startIcon={<BiExport />} onClick={handleExport}>
            Export Sources
          </Button>
          <Button onClick={() => setShowRssFinder(true)}>Find RSS Feeds</Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
        <RssFinderModal isOpen={showRssFinder} onClose={() => setShowRssFinder(false)} />
        <RssContentEditor
          isOpen={showRssEditor}
          onClose={() => setShowRssEditor(false)}
          feed={
            selectedCardForEditing
              ? {
                  url: selectedCardForEditing.feedUrl || '',
                  title: selectedCardForEditing.label,
                  type: 'rss',
                }
              : { url: '', title: '', type: '' }
          }
          existingCard={selectedCardForEditing || undefined}
        />
        <ConfirmModal
          showModal={confirmDelete.showModal}
          title={`Confirm ${confirmDelete.option?.isCustom ? 'delete' : 'remove'} source: ${
            confirmDelete.option?.label
          }`}
          description={`Are you sure you want to ${
            confirmDelete.option?.isCustom ? 'delete' : 'remove'
          } ${confirmDelete.option?.label} source? ${
            confirmDelete.option?.isCustom
              ? 'This action cannot be undone.'
              : 'You can add it back anytime.'
          }`}
          onClose={() =>
            setConfirmDelete({
              showModal: false,
              option: undefined,
            })
          }
          onConfirm={() => {
            if (!confirmDelete.option) {
              return
            }

            // If it's a custom source, remove it completely
            if (confirmDelete.option.isCustom) {
              const newUserCards = userCustomCards.filter(
                (card) => card.value !== confirmDelete.option?.value
              )
              const newCards = cards.filter((card) => card.name !== confirmDelete.option?.value)
              setCards(newCards)
              setUserCustomCards(newUserCards)
            } else {
              // If it's a supported source, just remove it from the selected cards
              const newCards = cards.filter((card) => card.name !== confirmDelete.option?.value)
              setCards(newCards)
            }
            setConfirmDelete({ showModal: false, option: undefined })
          }}
        />
        <ChipsSet
          canSelectMultiple={true}
          options={mergedSources}
          defaultValues={cards.map((source) => source.name)}
          onRemove={(option) => {
            setConfirmDelete({
              showModal: true,
              option: {
                ...option,
                isCustom: userCustomCards.some((card) => card.value === option.value),
              },
            })
          }}
          onChange={(changes, selectedChips) => {
            const selectedValues = selectedChips.map((chip) => chip.value)

            // Preserve existing card order and only add/remove cards as needed
            const existingCardsMap = new Map(cards.map((card) => [card.name, card]))
            const newSelectedValuesSet = new Set(selectedValues)

            // Keep existing cards that are still selected
            const keptCards = cards.filter((card) => newSelectedValuesSet.has(card.name))

            // Add new cards that weren't previously selected
            const newCardsToAdd = selectedValues
              .filter((source) => !existingCardsMap.has(source))
              .map((source, index) => {
                if (SUPPORTED_CARDS.find((sc) => sc.value === source)) {
                  return {
                    id: cards.length + index, // Use a new ID that doesn't conflict
                    name: source,
                    type: 'supported',
                  }
                } else if (userCustomCards.find((ucc) => ucc.value === source)) {
                  return {
                    id: cards.length + index, // Use a new ID that doesn't conflict
                    name: source,
                    type: 'rss',
                  }
                }
                return null
              })
              .filter(Boolean) as SelectedCard[]

            const updatedCards = [...keptCards, ...newCardsToAdd]

            setCards(updatedCards)

            if (changes.action == 'ADD') {
              trackSourceAdd(changes.option.value)
            } else {
              trackSourceRemove(changes.option.value)
            }
          }}
        />
        <hr />
        <>
          <header>
            <div className="settingsHeader">
              <h3 className="title">Add new Source</h3>
              <p className="description">
                Can't find your favorite source? Add its RSS feed URL here and it will be available
                in your feed.
              </p>
            </div>
          </header>
          <RssSetting />
        </>
      </>
    </SettingsContentLayout>
  )
}
