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

export interface Exhibition {
  id: string
  name: string
  themeType: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: string
  createdBy: string
  stampCount: number
  createdAt: string
  updatedAt: string
  stamps?: ExhibitionStamp[]
}

export interface ExhibitionStamp {
  id: string
  exhibitionId: string
  stampId: string
  stampName: string
  issueYear: number
  condition: string
  albumPage: string
  theme: string
  source: string
  displayRole: string
  displayNote: string
  expectedBorrowDate: string
  expectedReturnDate: string
  keeper: string
  status: string
  displayNarration: string
  memorialMeaning: string
  createdAt: string
  updatedAt: string
  exhibitionName?: string
  exhibitionStatus?: string
}

export interface Stats {
  themeDistribution: { name: string; value: number }[]
  unsortedAlbumPages: { name: string; count: number }[]
  topThemes: { name: string; count: number }[]
  circulationDistribution: { name: string; value: number }[]
  totalStamps: number
  totalStories: number
  activeCirculations: number
  totalExhibitions: number
  pendingExhibitionStamps: number
  exhibitionThemeDistribution: { name: string; value: number }[]
  exhibitionUsageByTheme: { name: string; count: number }[]
  keeperDistribution: { name: string; value: number }[]
}

interface StoreState {
  stamps: Stamp[]
  sets: SetItem[]
  themes: Theme[]
  stories: Story[]
  circulations: Circulation[]
  exhibitions: Exhibition[]
  currentExhibition: Exhibition | null
  exhibitionStamps: ExhibitionStamp[]
  stampExhibitions: ExhibitionStamp[]
  stats: Stats | null
  loading: boolean
  fetchStamps: () => Promise<void>
  fetchSets: () => Promise<void>
  fetchThemes: () => Promise<void>
  fetchStories: () => Promise<void>
  fetchCirculations: () => Promise<void>
  fetchExhibitions: (query?: Record<string, string>) => Promise<void>
  fetchExhibition: (id: string) => Promise<void>
  fetchExhibitionStamps: (exhibitionId: string) => Promise<void>
  fetchStampExhibitions: (stampId: string) => Promise<void>
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
  createExhibition: (data: Partial<Exhibition>) => Promise<Exhibition | undefined>
  updateExhibition: (id: string, data: Partial<Exhibition>) => Promise<void>
  deleteExhibition: (id: string) => Promise<void>
  addExhibitionStamp: (exhibitionId: string, data: Partial<ExhibitionStamp>) => Promise<void>
  updateExhibitionStamp: (exhibitionId: string, stampId: string, data: Partial<ExhibitionStamp>) => Promise<void>
  confirmExhibitionStamp: (exhibitionId: string, stampId: string) => Promise<void>
  deferExhibitionStamp: (exhibitionId: string, stampId: string) => Promise<void>
  replaceExhibitionStamp: (exhibitionId: string, oldStampId: string, newStampId: string, displayRole?: string, keeper?: string) => Promise<void>
  removeExhibitionStamp: (exhibitionId: string, stampId: string) => Promise<void>
  setCurrentExhibition: (exhibition: Exhibition | null) => void
}

const useStore = create<StoreState>((set, get) => ({
  stamps: [],
  sets: [],
  themes: [],
  stories: [],
  circulations: [],
  exhibitions: [],
  currentExhibition: null,
  exhibitionStamps: [],
  stampExhibitions: [],
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

  fetchExhibitions: async (query) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (query) {
        Object.entries(query).forEach(([k, v]) => v && params.append(k, v))
      }
      const data = await api.get('/exhibitions', { params })
      set({ exhibitions: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchExhibition: async (id) => {
    try {
      const data = await api.get(`/exhibitions/${id}`)
      const exhibition = (data as any).data || (data as any)
      set({ currentExhibition: exhibition })
      return exhibition
    } catch {}
  },

  fetchExhibitionStamps: async (exhibitionId) => {
    try {
      const data = await api.get(`/exhibitions/${exhibitionId}/stamps`)
      set({ exhibitionStamps: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchStampExhibitions: async (stampId) => {
    try {
      const data = await api.get(`/exhibitions/stamps/${stampId}/exhibitions`)
      set({ stampExhibitions: (data as any).data || (data as any) || [] })
    } catch {}
  },

  createExhibition: async (data) => {
    try {
      const result = await api.post('/exhibitions', data)
      const exhibition = (result as any).data || (result as any)
      set({ exhibitions: [...get().exhibitions, exhibition] })
      return exhibition
    } catch {}
  },

  updateExhibition: async (id, data) => {
    try {
      const result = await api.put(`/exhibitions/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({
        exhibitions: get().exhibitions.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        currentExhibition: get().currentExhibition?.id === id ? { ...get().currentExhibition, ...updated } : get().currentExhibition,
      })
    } catch {}
  },

  deleteExhibition: async (id) => {
    try {
      await api.delete(`/exhibitions/${id}`)
      set({
        exhibitions: get().exhibitions.filter((e) => e.id !== id),
        currentExhibition: get().currentExhibition?.id === id ? null : get().currentExhibition,
      })
    } catch {}
  },

  addExhibitionStamp: async (exhibitionId, data) => {
    try {
      const result = await api.post(`/exhibitions/${exhibitionId}/stamps`, data)
      set({ exhibitionStamps: (result as any).data || (result as any) || [] })
      get().fetchExhibitions()
    } catch {}
  },

  updateExhibitionStamp: async (exhibitionId, stampId, data) => {
    try {
      const result = await api.put(`/exhibitions/${exhibitionId}/stamps/${stampId}`, data)
      set({ exhibitionStamps: (result as any).data || (result as any) || [] })
    } catch {}
  },

  confirmExhibitionStamp: async (exhibitionId, stampId) => {
    try {
      const result = await api.put(`/exhibitions/${exhibitionId}/stamps/${stampId}/confirm`)
      set({ exhibitionStamps: (result as any).data || (result as any) || [] })
      get().fetchExhibitions()
    } catch {}
  },

  deferExhibitionStamp: async (exhibitionId, stampId) => {
    try {
      const result = await api.put(`/exhibitions/${exhibitionId}/stamps/${stampId}/defer`)
      set({ exhibitionStamps: (result as any).data || (result as any) || [] })
    } catch {}
  },

  replaceExhibitionStamp: async (exhibitionId, oldStampId, newStampId, displayRole, keeper) => {
    try {
      const result = await api.put(`/exhibitions/${exhibitionId}/stamps/${oldStampId}/replace`, {
        newStampId: Number(newStampId),
        displayRole,
        keeper,
      })
      set({ exhibitionStamps: (result as any).data || (result as any) || [] })
      get().fetchExhibitions()
    } catch {}
  },

  removeExhibitionStamp: async (exhibitionId, stampId) => {
    try {
      const result = await api.put(`/exhibitions/${exhibitionId}/stamps/${stampId}/remove`)
      set({ exhibitionStamps: (result as any).data || (result as any) || [] })
      get().fetchExhibitions()
    } catch {}
  },

  setCurrentExhibition: (exhibition) => {
    set({ currentExhibition: exhibition })
  },
}))

export default useStore
