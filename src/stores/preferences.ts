import { Occupation } from 'src/features/onboarding/types'
import { Tag, useRemoteConfigStore } from 'src/features/remoteConfig'
import { enhanceTags } from 'src/utils/DataEnhancement'
import { create } from 'zustand'
import { StateStorage, createJSONStorage, persist } from 'zustand/middleware'
import {
  CardSettingsType,
  DNDDuration,
  EditableContent,
  Layout,
  ListingMode,
  SearchEngineType,
  SelectedCard,
  SupportedCardType,
  Theme,
} from '../types'

export type UserPreferencesState = {
  userSelectedTags: Tag[]
  layout: Layout
  theme: Theme
  openLinksNewTab: boolean
  onboardingCompleted: boolean
  onboardingResult: Omit<Occupation, 'icon'> | null
  listingMode: ListingMode
  promptEngine: string
  promptEngines: SearchEngineType[]
  maxVisibleCards: number
  cards: SelectedCard[]
  cardsSettings: Record<string, CardSettingsType>
  firstSeenDate: number
  userCustomCards: SupportedCardType[]
  DNDDuration: DNDDuration
  // Add organize mode state
  isOrganizeMode: boolean
}

// Add the isDNDModeActive function
export const isDNDModeActive = (DNDDuration: DNDDuration): boolean => {
  if (DNDDuration === 'always') {
    return true
  } else if (typeof DNDDuration === 'object' && DNDDuration !== null) {
    // Type guard to ensure DNDDuration is the object type
    const dndObject = DNDDuration as { value: number; countdown: number }
    return Boolean(dndObject.value && dndObject.countdown - new Date().getTime() > 0)
  } else {
    return false
  }
}

type UserPreferencesStoreActions = {
  setLayout: (layout: Layout) => void
  setTheme: (theme: Theme) => void
  setPromptEngine: (engine: string) => void
  setOpenLinksNewTab: (openLinksNewTab: boolean) => void
  setListingMode: (listingMode: ListingMode) => void
  setTags: (selectedTags: Tag[]) => void
  setMaxVisibleCards: (maxVisibleCards: number) => void
  initState: (newState: UserPreferencesState) => void
  setCards: (selectedCards: SelectedCard[]) => void
  setCardSettings: (card: string, settings: CardSettingsType) => void
  markOnboardingAsCompleted: (occupation: Omit<Occupation, 'icon'> | null) => void
  setUserCustomCards: (cards: SupportedCardType[]) => void
  updateUserCustomCards: (cards: SupportedCardType[]) => void
  updateCardOrder: (prevIndex: number, newIndex: number) => void
  // Add new action for updating editable content
  updateEditableContent: (cardValue: string, content: EditableContent[]) => void
  // Add organize mode actions
  setIsOrganizeMode: (isOrganizeMode: boolean) => void
  setDNDDuration: (duration: DNDDuration) => void
  // Add DND mode active function
  isDNDModeActive: () => boolean
}

const defaultStorage: StateStorage = {
  getItem: (name: string) => {
    const item = window.localStorage.getItem(name)
    if (!item) {
      return null
    }

    try {
      let {
        version,
        state,
      }: {
        version: number
        state: UserPreferencesState
      } = JSON.parse(item)

      const remoteConfigStore = useRemoteConfigStore.getState()

      const newState = {
        ...state,
        userSelectedTags: enhanceTags(
          remoteConfigStore,
          state.userSelectedTags as unknown as string[]
        ),
      }

      return JSON.stringify({ state: newState, version })
    } catch (e) {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      let {
        state,
        version,
      }: {
        version: number
        state: UserPreferencesState
      } = JSON.parse(value)

      const newState = {
        ...state,
        userSelectedTags: state.userSelectedTags.map((tag) => tag.value),
      }

      const newValue = JSON.stringify({ state: newState, version })
      window.localStorage.setItem(name, newValue)
    } catch (e) {
      window.localStorage.setItem(name, '')
    }
  },
  removeItem: (name: string) => {
    window.localStorage.removeItem(name)
  },
}

export const useUserPreferences = create(
  persist<UserPreferencesState & UserPreferencesStoreActions>(
    (set, get) => ({
      userSelectedTags: [
        {
          value: 'javascript',
          label: 'Javascript',
          githubValues: ['javascript'],
          confsValues: ['javascript'],
          devtoValues: ['javascript'],
          hashnodeValues: ['javascript'],
          mediumValues: ['javascript'],
          redditValues: ['javascript'],
          freecodecampValues: ['javascript'],
        },
      ],
      layout: 'cards',
      cardsSettings: {},
      maxVisibleCards: 4,
      theme: 'dark',
      onboardingCompleted: false,
      onboardingResult: null,
      promptEngine: 'chatgpt',
      promptEngines: [],
      listingMode: 'normal',
      openLinksNewTab: true,
      firstSeenDate: Date.now(),
      cards: [
        { id: 0, name: 'github', type: 'supported' },
        { id: 1, name: 'hackernews', type: 'supported' },
        { id: 2, name: 'ai', type: 'supported' },
        { id: 3, name: 'producthunt', type: 'supported' },
      ],
      userCustomCards: [],
      DNDDuration: 'never',
      isOrganizeMode: false,
      setLayout: (layout) => set({ layout: layout }),
      setPromptEngine: (promptEngine: string) => set({ promptEngine: promptEngine }),
      setListingMode: (listingMode: ListingMode) => set({ listingMode: listingMode }),
      setTheme: (theme: Theme) => set({ theme: theme }),
      setOpenLinksNewTab: (openLinksNewTab: boolean) => set({ openLinksNewTab: openLinksNewTab }),
      setCards: (selectedCards: SelectedCard[]) => set({ cards: selectedCards }),
      setTags: (selectedTags: Tag[]) => set({ userSelectedTags: selectedTags }),
      setMaxVisibleCards: (maxVisibleCards: number) => set({ maxVisibleCards: maxVisibleCards }),
      initState: (newState: UserPreferencesState) =>
        set(() => {
          return { ...newState }
        }),
      setCardSettings: (card: string, settings: CardSettingsType) =>
        set((state) => ({
          cardsSettings: {
            ...state.cardsSettings,
            [card]: { ...state.cardsSettings[card], ...settings },
          },
        })),
      markOnboardingAsCompleted: (occupation: Omit<Occupation, 'icon'> | null) =>
        set(() => ({
          onboardingCompleted: true,
          onboardingResult: occupation,
        })),
      setUserCustomCards: (cards: SupportedCardType[]) => set({ userCustomCards: cards }),
      updateUserCustomCards: (cards: SupportedCardType[]) => set({ userCustomCards: cards }),
      updateCardOrder: (prevIndex: number, newIndex: number) =>
        set((state) => {
          const updated = [...state.cards]
          const [movedItem] = updated.splice(prevIndex, 1)
          updated.splice(newIndex, 0, movedItem)
          return { cards: updated }
        }),
      // Add new action for updating editable content
      updateEditableContent: (cardValue: string, content: EditableContent[]) =>
        set((state) => ({
          userCustomCards: state.userCustomCards.map((card) =>
            card.value === cardValue ? { ...card, editableContent: content } : card
          ),
        })),
      // Add organize mode actions
      setIsOrganizeMode: (isOrganizeMode: boolean) => set({ isOrganizeMode }),
      setDNDDuration: (duration: DNDDuration) => set({ DNDDuration: duration }),
      // Add DND mode active function
      isDNDModeActive: () => {
        const state = get()
        return isDNDModeActive(state.DNDDuration)
      },
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
      /*partialize: (state: UserPreferencesState & UserPreferencesStoreActions) => {
        // Extract only the state properties to persist
        const stateToPersist: UserPreferencesState = {
          userSelectedTags: state.userSelectedTags,
          layout: state.layout,
          theme: state.theme,
          openLinksNewTab: state.openLinksNewTab,
          onboardingCompleted: state.onboardingCompleted,
          onboardingResult: state.onboardingResult,
          listingMode: state.listingMode,
          promptEngine: state.promptEngine,
          promptEngines: state.promptEngines,
          maxVisibleCards: state.maxVisibleCards,
          cards: state.cards,
          cardsSettings: state.cardsSettings,
          firstSeenDate: state.firstSeenDate,
          userCustomCards: state.userCustomCards,
          DNDDuration: state.DNDDuration,
          isOrganizeMode: state.isOrganizeMode,
        };
        return stateToPersist;
      },*/
    }
  )
)
