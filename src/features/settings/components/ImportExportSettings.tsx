import React, { useRef, useState } from 'react'
import { Button } from 'src/components/Elements'
import { SettingsContentLayout } from 'src/components/Layout/SettingsContentLayout/SettingsContentLayout'
import { AI_PROMPT_ENGINES } from 'src/config/SearchEngines'
import { useUserPreferences } from 'src/stores/preferences'
import { SearchEngineType } from 'src/types'

export const ImportExportSettings = () => {
  const {
    userSelectedTags,
    layout,
    theme,
    openLinksNewTab,
    listingMode,
    promptEngine,
    promptEngines,
    maxVisibleCards,
    cards,
    cardsSettings,
    userCustomCards,
    DNDDuration,
    setTags,
    setLayout,
    setTheme,
    setOpenLinksNewTab,
    setListingMode,
    setPromptEngine,
    setMaxVisibleCards,
    setCards,
    setUserCustomCards,
    setDNDDuration,
    addSearchEngine,
    removeSearchEngine,
  } = useUserPreferences()

  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export all settings to a JSON file
  const handleExport = () => {
    try {
      const exportData = {
        // General settings
        layout,
        theme,
        openLinksNewTab,
        listingMode,
        maxVisibleCards,
        DNDDuration,

        // Sources (news)
        selectedCards: cards,
        userCustomCards,

        // Topics/Tags
        userSelectedTags,

        // Search engines and prompt engines
        promptEngine,
        promptEngines,

        // Card settings
        cardsSettings,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

      const exportFileDefaultName = `hackertab-settings-${new Date()
        .toISOString()
        .slice(0, 10)}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      setExportStatus('Settings exported successfully!')
      setTimeout(() => setExportStatus(null), 3000)
    } catch (error) {
      setExportStatus('Error exporting settings: ' + (error as Error).message)
      setTimeout(() => setExportStatus(null), 5000)
    }
  }

  // Import settings from a JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        // Import general settings
        if (importedData.layout) setLayout(importedData.layout)
        if (importedData.theme) setTheme(importedData.theme)
        if (typeof importedData.openLinksNewTab === 'boolean')
          setOpenLinksNewTab(importedData.openLinksNewTab)
        if (importedData.listingMode) setListingMode(importedData.listingMode)
        if (typeof importedData.maxVisibleCards === 'number')
          setMaxVisibleCards(importedData.maxVisibleCards)
        if (importedData.DNDDuration) setDNDDuration(importedData.DNDDuration)

        // Import sources (news)
        if (importedData.selectedCards) setCards(importedData.selectedCards)
        if (importedData.userCustomCards) setUserCustomCards(importedData.userCustomCards)

        // Import topics/tags
        if (importedData.userSelectedTags) setTags(importedData.userSelectedTags)

        // Import search engines and prompt engines
        if (importedData.promptEngines) {
          // First, remove all custom engines
          promptEngines.forEach((engine) => {
            if (!AI_PROMPT_ENGINES.some((defaultEngine) => defaultEngine.url === engine.url)) {
              removeSearchEngine(engine.url)
            }
          })

          // Then add imported custom engines
          importedData.promptEngines.forEach((engine: SearchEngineType) => {
            // Only add engines that are not default engines
            if (!AI_PROMPT_ENGINES.some((defaultEngine) => defaultEngine.url === engine.url)) {
              addSearchEngine(engine)
            }
          })
        }

        // Set prompt engine after importing engines
        if (importedData.promptEngine) setPromptEngine(importedData.promptEngine)

        setImportStatus('Settings imported successfully!')
        setTimeout(() => setImportStatus(null), 3000)
      } catch (error) {
        setImportStatus('Error importing settings: ' + (error as Error).message)
        setTimeout(() => setImportStatus(null), 5000)
      }
    }
    reader.readAsText(file)
    // Reset file input
    event.target.value = ''
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <SettingsContentLayout
      title="Import/Export Settings"
      description="Backup and restore your HackerTab configuration including news sources, search engines, and preferences.">
      <div className="settingRow">
        <p className="settingTitle">Export Settings</p>
        <div className="settingContent">
          <Button onClick={handleExport}>Export to JSON</Button>
          {exportStatus && (
            <div className="settingHint">
              <p>{exportStatus}</p>
            </div>
          )}
        </div>
      </div>

      <div className="settingRow">
        <p className="settingTitle">Import Settings</p>
        <div className="settingContent">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            ref={fileInputRef}
            id="import-settings-input"
          />
          <Button onClick={triggerFileInput}>Import from JSON</Button>
          {importStatus && (
            <div className="settingHint">
              <p>{importStatus}</p>
            </div>
          )}
        </div>
      </div>
    </SettingsContentLayout>
  )
}
