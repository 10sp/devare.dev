import { useState } from 'react'
import { HiSparkles } from 'react-icons/hi'
import { ChipsSet, ConfirmModal } from 'src/components/Elements'
import { SettingsContentLayout } from 'src/components/Layout/SettingsContentLayout/SettingsContentLayout'
import { AI_PROMPT_ENGINES } from 'src/config/SearchEngines'
import { identifyUserSearchEngine, trackSearchEngineSelect } from 'src/lib/analytics'
import { useUserPreferences } from 'src/stores/preferences'
import { AddSearchEngine } from './AddSearchEngine'

export const SearchEngineSettings = () => {
  const { promptEngines, promptEngine, removeSearchEngine, setPromptEngine } = useUserPreferences()
  const [confirmDelete, setConfirmDelete] = useState<{
    showModal: boolean
    engine?: { label: string; url: string; isDefault: boolean }
  }>({
    showModal: false,
    engine: undefined,
  })
  const mergedSearchEngines = [...AI_PROMPT_ENGINES, ...promptEngines]

  return (
    <SettingsContentLayout
      title="AI Prompt Engine"
      description={`
     Select from top AI models, input your prompt, and get quick responses. 
      You can also add a new ai model engine by providing its URL.
    `}>
      <>
        <ConfirmModal
          showModal={confirmDelete.showModal}
          title={`Confirm ${confirmDelete.engine?.isDefault ? 'removal' : 'deletion'} of engine: ${
            confirmDelete.engine?.label
          }`}
          description={`Are you sure you want to ${
            confirmDelete.engine?.isDefault ? 'remove' : 'delete'
          } the ${confirmDelete.engine?.label} engine? ${
            confirmDelete.engine?.isDefault
              ? 'You can add it back anytime.'
              : 'This action cannot be undone.'
          }`}
          onClose={() =>
            setConfirmDelete({
              showModal: false,
              engine: undefined,
            })
          }
          onConfirm={() => {
            if (!confirmDelete.engine) {
              return
            }
            removeSearchEngine(confirmDelete.engine.url)
            setConfirmDelete({ showModal: false, engine: undefined })
          }}
        />
        <ChipsSet
          canSelectMultiple={false}
          options={mergedSearchEngines.map((engine) => {
            return {
              label: engine.label,
              value: engine.url,
              removeable: true, // Allow removal of all engines now
              icon:
                engine?.default === false ? (
                  <HiSparkles />
                ) : (
                  <img
                    className="lang_icon"
                    src={`/searchengine_logos/${engine.label.toLowerCase()}_logo.svg`}
                  />
                ),
            }
          })}
          defaultValues={[mergedSearchEngines.find((se) => se.label === promptEngine)?.url || '']}
          onRemove={(option) => {
            const engine = mergedSearchEngines.find((se) => se.url === option.value)
            if (engine) {
              setConfirmDelete({
                showModal: true,
                engine: {
                  label: engine.label,
                  url: engine.url,
                  isDefault: engine.default === true,
                },
              })
            }
          }}
          onChange={(changes) => {
            const value = changes.option

            identifyUserSearchEngine(value.label)
            trackSearchEngineSelect(value.label)
            setPromptEngine(value.label)
          }}
        />
        <hr />
        <>
          <header>
            <div className="settingsHeader">
              <h3 className="title">Add new AI prompt Engine</h3>
              <p className="description">
                Can't find your favorite AI prompt engine? Add it here and it.
              </p>
            </div>
          </header>
          <AddSearchEngine />
        </>
      </>
    </SettingsContentLayout>
  )
}
