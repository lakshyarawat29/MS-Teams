import { create } from 'zustand'

export type Section = 'teams' | 'chat' | 'calendar' | 'search'

interface UIState {
  activeSection: Section
  setActiveSection: (section: Section) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeSection: 'teams',
  setActiveSection: (activeSection) => set({ activeSection }),
}))
