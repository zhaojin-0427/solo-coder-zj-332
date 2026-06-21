import { create } from 'zustand'
import api from '@/utils/api'

export interface Stamp {
  id: string
  name: string
  issueYear: number
  theme: string
  condition: string
  source: string
  albumPage: string
  setId: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Theme {
  id: string
  name: string
  category: string
  description: string
  createdAt: string
}

export interface Story {
  id: string
  stampId: string
  author: string
  storyType: string
  content: string
  createdAt: string
}

export interface Circulation {
  id: string
  stampId: string
  type: string
  fromPerson: string
  toPerson: string
  purpose: string
  borrowDate: string
  returnDate: string
  note: string
  status: string
  createdAt: string
}

export interface Stats {
  themeDistribution: { name: string; value: number }[]
  unsortedAlbumPages: { name: string; count: number }[]
  topThemes: { name: string; count: number }[]
  circulationDistribution: { name: string; value: number }[]
  totalStamps: number
  totalStories: number
  activeCirculations: number
}

interface StoreState {
  stamps: Stamp[]
  themes: Theme[]
  stories: Story[]
  circulations: Circulation[]
  stats: Stats | null
  loading: boolean
  fetchStamps: () => Promise<void>
  fetchThemes: () => Promise<void>
  fetchStories: () => Promise<void>
  fetchCirculations: () => Promise<void>
  fetchStats: () => Promise<void>
  createStamp: (data: Partial<Stamp>) => Promise<void>
  updateStamp: (id: string, data: Partial<Stamp>) => Promise<void>
  deleteStamp: (id: string) => Promise<void>
  createTheme: (data: Partial<Theme>) => Promise<void>
  updateTheme: (id: string, data: Partial<Theme>) => Promise<void>
  deleteTheme: (id: string) => Promise<void>
  createStory: (data: Partial<Story>) => Promise<void>
  updateStory: (id: string, data: Partial<Story>) => Promise<void>
  deleteStory: (id: string) => Promise<void>
  createCirculation: (data: Partial<Circulation>) => Promise<void>
  updateCirculation: (id: string, data: Partial<Circulation>) => Promise<void>
  deleteCirculation: (id: string) => Promise<void>
}

const useStore = create<StoreState>((set, get) => ({
  stamps: [],
  themes: [],
  stories: [],
  circulations: [],
  stats: null,
  loading: false,

  fetchStamps: async () => {
    set({ loading: true })
    try {
      const data = await api.get('/stamps')
      set({ stamps: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchThemes: async () => {
    set({ loading: true })
    try {
      const data = await api.get('/themes')
      set({ themes: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchStories: async () => {
    set({ loading: true })
    try {
      const data = await api.get('/stories')
      set({ stories: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchCirculations: async () => {
    set({ loading: true })
    try {
      const data = await api.get('/circulations')
      set({ circulations: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const data = await api.get('/stats')
      set({ stats: (data as any).data || (data as any) || null })
    } catch {}
  },

  createStamp: async (data) => {
    try {
      const result = await api.post('/stamps', data)
      const stamp = (result as any).data || (result as any)
      set({ stamps: [...get().stamps, stamp] })
    } catch {}
  },

  updateStamp: async (id, data) => {
    try {
      const result = await api.put(`/stamps/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({ stamps: get().stamps.map((s) => (s.id === id ? { ...s, ...updated } : s)) })
    } catch {}
  },

  deleteStamp: async (id) => {
    try {
      await api.delete(`/stamps/${id}`)
      set({ stamps: get().stamps.filter((s) => s.id !== id) })
    } catch {}
  },

  createTheme: async (data) => {
    try {
      const result = await api.post('/themes', data)
      const theme = (result as any).data || (result as any)
      set({ themes: [...get().themes, theme] })
    } catch {}
  },

  updateTheme: async (id, data) => {
    try {
      const result = await api.put(`/themes/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({ themes: get().themes.map((t) => (t.id === id ? { ...t, ...updated } : t)) })
    } catch {}
  },

  deleteTheme: async (id) => {
    try {
      await api.delete(`/themes/${id}`)
      set({ themes: get().themes.filter((t) => t.id !== id) })
    } catch {}
  },

  createStory: async (data) => {
    try {
      const result = await api.post('/stories', data)
      const story = (result as any).data || (result as any)
      set({ stories: [...get().stories, story] })
    } catch {}
  },

  updateStory: async (id, data) => {
    try {
      const result = await api.put(`/stories/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({ stories: get().stories.map((s) => (s.id === id ? { ...s, ...updated } : s)) })
    } catch {}
  },

  deleteStory: async (id) => {
    try {
      await api.delete(`/stories/${id}`)
      set({ stories: get().stories.filter((s) => s.id !== id) })
    } catch {}
  },

  createCirculation: async (data) => {
    try {
      const result = await api.post('/circulations', data)
      const circ = (result as any).data || (result as any)
      set({ circulations: [...get().circulations, circ] })
    } catch {}
  },

  updateCirculation: async (id, data) => {
    try {
      const result = await api.put(`/circulations/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({ circulations: get().circulations.map((c) => (c.id === id ? { ...c, ...updated } : c)) })
    } catch {}
  },

  deleteCirculation: async (id) => {
    try {
      await api.delete(`/circulations/${id}`)
      set({ circulations: get().circulations.filter((c) => c.id !== id) })
    } catch {}
  },
}))

export default useStore
