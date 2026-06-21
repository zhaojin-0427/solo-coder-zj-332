import { create } from 'zustand'
import api from '@/utils/api'

export interface StampTheme {
  id: string
  name: string
  category: string
  description: string
  createdAt: string
}

export interface Stamp {
  id: string
  name: string
  issueYear: number
  theme: string
  condition: string
  source: string
  albumPage: string
  setId: string
  setName: string
  image?: string
  themes: StampTheme[]
  createdAt: string
  updatedAt: string
}

export interface SetItem {
  id: string
  name: string
  description: string
  stampCount: number
  createdAt: string
}

export interface Theme {
  id: string
  name: string
  category: string
  description: string
  stampCount: number
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
  sets: SetItem[]
  themes: Theme[]
  stories: Story[]
  circulations: Circulation[]
  stats: Stats | null
  loading: boolean
  fetchStamps: () => Promise<void>
  fetchSets: () => Promise<void>
  fetchThemes: () => Promise<void>
  fetchStories: () => Promise<void>
  fetchCirculations: () => Promise<void>
  fetchStats: () => Promise<void>
  createStamp: (data: Partial<Stamp>) => Promise<void>
  updateStamp: (id: string, data: Partial<Stamp>) => Promise<void>
  deleteStamp: (id: string) => Promise<void>
  mergeStamps: (stampIds: string[], targetAlbumPage: string, setId: string) => Promise<void>
  createTheme: (data: Partial<Theme>) => Promise<void>
  updateTheme: (id: string, data: Partial<Theme>) => Promise<void>
  deleteTheme: (id: string) => Promise<void>
  addStampTheme: (stampId: string, themeId: string) => Promise<void>
  removeStampTheme: (stampId: string, themeId: string) => Promise<void>
  setStampThemes: (stampId: string, themeIds: string[]) => Promise<void>
  createStory: (data: Partial<Story>) => Promise<void>
  updateStory: (id: string, data: Partial<Story>) => Promise<void>
  deleteStory: (id: string) => Promise<void>
  createCirculation: (data: Partial<Circulation>) => Promise<void>
  updateCirculation: (id: string, data: Partial<Circulation>) => Promise<void>
  deleteCirculation: (id: string) => Promise<void>
}

const useStore = create<StoreState>((set, get) => ({
  stamps: [],
  sets: [],
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

  fetchSets: async () => {
    try {
      const data = await api.get('/sets')
      set({ sets: (data as any).data || (data as any) || [] })
    } catch {}
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
      return stamp
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

  mergeStamps: async (stampIds, targetAlbumPage, setId) => {
    try {
      const result = await api.post('/stamps/merge', { stampIds, targetAlbumPage, setId })
      const merged = (result as any).data || (result as any)
      set({ stamps: get().stamps.map((s) => {
        const updated = merged.find((m: any) => String(m.id) === String(s.id))
        return updated ? { ...s, ...updated } : s
      })})
      get().fetchStamps()
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

  addStampTheme: async (stampId, themeId) => {
    try {
      const result = await api.post(`/stamps/${stampId}/themes`, { themeId: Number(themeId) })
      const updated = (result as any).data || (result as any)
      set({ stamps: get().stamps.map((s) => (s.id === stampId ? { ...s, ...updated } : s)) })
    } catch {}
  },

  removeStampTheme: async (stampId, themeId) => {
    try {
      const result = await api.delete(`/stamps/${stampId}/themes/${themeId}`)
      const updated = (result as any).data || (result as any)
      set({ stamps: get().stamps.map((s) => (s.id === stampId ? { ...s, ...updated } : s)) })
    } catch {}
  },

  setStampThemes: async (stampId, themeIds) => {
    try {
      const result = await api.put(`/stamps/${stampId}/themes`, { themeIds: themeIds.map(Number) })
      const updated = (result as any).data || (result as any)
      set({ stamps: get().stamps.map((s) => (s.id === stampId ? { ...s, ...updated } : s)) })
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
