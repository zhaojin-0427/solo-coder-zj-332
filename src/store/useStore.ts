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

export interface AudioPackage {
  id: string
  name: string
  themeType: string
  description: string
  targetElderly: string
  status: string
  createdBy: string
  itemCount: number
  pendingItemCount: number
  createdAt: string
  updatedAt: string
  items?: AudioPackageItem[]
  feedback?: PackageFeedback[]
  followUps?: PackageFollowUp[]
}

export interface AudioPackageItem {
  id: string
  packageId: string
  stampId: string
  stampName: string
  issueYear: number
  condition: string
  stampTheme: string
  title: string
  content: string
  audioUrl: string
  duration: number
  narrator: string
  displayOrder: number
  status: string
  createdAt: string
  updatedAt: string
  packageName?: string
  packageStatus?: string
  themeType?: string
  targetElderly?: string
}

export interface PackageFeedback {
  id: string
  packageId: string
  itemId: string
  itemTitle: string
  elderlyPerson: string
  feedbackType: string
  rating: number
  content: string
  createdAt: string
}

export interface PackageFollowUp {
  id: string
  packageId: string
  itemId: string
  itemTitle: string
  title: string
  description: string
  assignee: string
  priority: string
  status: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface Explanation {
  id: string
  title: string
  themeType: string
  participants: string
  targetElderly: string
  planDate: string
  keyPoints: string
  familyReminder: string
  status: string
  createdBy: string
  createdAt: string
  updatedAt: string
  stampCount?: number
  feedbackCount?: number
  followUpCount?: number
  stamps?: ExplanationStamp[]
  feedback?: ExplanationFeedback[]
  followUps?: ExplanationFollowUp[]
  visits?: ExplanationVisit[]
}

export interface ExplanationStamp {
  id: string
  explanationId: string
  stampId: string
  stampName?: string
  issueYear?: number
  stampTheme?: string
  stampCondition?: string
  stampSource?: string
  albumPage?: string
  imageUrl?: string
  stampExcerpt: string
  storyExcerpt: string
  audioExcerpt: string
  createdAt: string
}

export interface ExplanationFeedback {
  id: string
  explanationId: string
  elderlyPerson: string
  feedbackType: string
  content: string
  createdAt: string
}

export interface ExplanationFollowUp {
  id: string
  explanationId: string
  feedbackId?: string
  feedbackElderly?: string
  feedbackTypeSource?: string
  title: string
  description: string
  assignee: string
  priority: string
  status: string
  dueDate: string
  source: string
  createdAt: string
  updatedAt: string
}

export interface ExplanationVisit {
  id: string
  explanationId: string
  visitor: string
  visitDate: string
  visitNote: string
  elderlyResponse: string
  nextPlan: string
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
  totalExhibitions: number
  pendingExhibitionStamps: number
  exhibitionThemeDistribution: { name: string; value: number }[]
  exhibitionUsageByTheme: { name: string; count: number }[]
  keeperDistribution: { name: string; value: number }[]
  totalAudioPackages: number
  pendingItemsCount: number
  packageThemeDistribution: { name: string; value: number }[]
  itemThemeDistribution: { name: string; count: number }[]
  feedbackTypeDistribution: { name: string; value: number }[]
  feedbackElderlyDistribution: { name: string; value: number }[]
  followUpStatusDistribution: { name: string; value: number }[]
  totalExplanations: number
  pendingVisitsCount: number
  explanationThemeDistribution: { name: string; value: number }[]
  explanationFrequencyByTheme: { name: string; count: number }[]
  explanationFeedbackDistribution: { name: string; value: number }[]
  explanationFollowUpCount: number
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
  audioPackages: AudioPackage[]
  currentAudioPackage: AudioPackage | null
  packageItems: AudioPackageItem[]
  packageFeedback: PackageFeedback[]
  packageFollowUps: PackageFollowUp[]
  stampAudioPackages: AudioPackageItem[]
  explanations: Explanation[]
  currentExplanation: Explanation | null
  explanationStamps: ExplanationStamp[]
  explanationFeedback: ExplanationFeedback[]
  explanationFollowUps: ExplanationFollowUp[]
  explanationVisits: ExplanationVisit[]
  pendingVisits: Explanation[]
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
  fetchAudioPackages: (query?: Record<string, string>) => Promise<void>
  fetchAudioPackage: (id: string) => Promise<AudioPackage | undefined>
  fetchPackageItems: (packageId: string) => Promise<void>
  fetchPackageFeedback: (packageId: string) => Promise<void>
  fetchPackageFollowUps: (packageId: string) => Promise<void>
  fetchStampAudioPackages: (stampId: string) => Promise<void>
  createAudioPackage: (data: Partial<AudioPackage>) => Promise<AudioPackage | undefined>
  updateAudioPackage: (id: string, data: Partial<AudioPackage>) => Promise<void>
  deleteAudioPackage: (id: string) => Promise<void>
  addPackageItem: (packageId: string, data: Partial<AudioPackageItem>) => Promise<void>
  updatePackageItem: (packageId: string, itemId: string, data: Partial<AudioPackageItem>) => Promise<void>
  updatePackageItemStatus: (packageId: string, itemId: string, status: string) => Promise<void>
  removePackageItem: (packageId: string, itemId: string) => Promise<boolean>
  addPackageFeedback: (packageId: string, data: Partial<PackageFeedback>) => Promise<void>
  removePackageFeedback: (packageId: string, feedbackId: string) => Promise<boolean>
  addPackageFollowUp: (packageId: string, data: Partial<PackageFollowUp>) => Promise<void>
  updatePackageFollowUp: (packageId: string, followUpId: string, data: Partial<PackageFollowUp>) => Promise<void>
  updatePackageFollowUpStatus: (packageId: string, followUpId: string, status: string) => Promise<void>
  removePackageFollowUp: (packageId: string, followUpId: string) => Promise<boolean>
  setCurrentAudioPackage: (pkg: AudioPackage | null) => void
  fetchExplanations: (query?: Record<string, string>) => Promise<void>
  fetchPendingVisits: (query?: Record<string, string>) => Promise<void>
  fetchExplanation: (id: string) => Promise<Explanation | undefined>
  fetchExplanationStamps: (explanationId: string) => Promise<void>
  fetchExplanationFeedback: (explanationId: string) => Promise<void>
  fetchExplanationFollowUps: (explanationId: string) => Promise<void>
  fetchExplanationVisits: (explanationId: string) => Promise<void>
  createExplanation: (data: Partial<Explanation> & { stamps?: any[] }) => Promise<Explanation | undefined>
  updateExplanation: (id: string, data: Partial<Explanation>) => Promise<void>
  deleteExplanation: (id: string) => Promise<void>
  updateExplanationStatus: (id: string, status: string) => Promise<void>
  addExplanationStamp: (explanationId: string, data: any) => Promise<void>
  updateExplanationStamp: (explanationId: string, stampId: string, data: any) => Promise<void>
  removeExplanationStamp: (explanationId: string, stampId: string) => Promise<boolean>
  addExplanationFeedback: (explanationId: string, data: any) => Promise<void>
  removeExplanationFeedback: (explanationId: string, feedbackId: string) => Promise<boolean>
  convertFeedbackToFollowUp: (explanationId: string, feedbackId: string, data: any) => Promise<void>
  appendFeedbackToStory: (explanationId: string, feedbackId: string, data?: any) => Promise<void>
  addExplanationFollowUp: (explanationId: string, data: any) => Promise<void>
  updateExplanationFollowUp: (explanationId: string, followUpId: string, data: any) => Promise<void>
  updateExplanationFollowUpStatus: (explanationId: string, followUpId: string, status: string) => Promise<void>
  removeExplanationFollowUp: (explanationId: string, followUpId: string) => Promise<boolean>
  addExplanationVisit: (explanationId: string, data: any) => Promise<void>
  setCurrentExplanation: (exp: Explanation | null) => void
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
  audioPackages: [],
  currentAudioPackage: null,
  packageItems: [],
  packageFeedback: [],
  packageFollowUps: [],
  stampAudioPackages: [],
  explanations: [],
  currentExplanation: null,
  explanationStamps: [],
  explanationFeedback: [],
  explanationFollowUps: [],
  explanationVisits: [],
  pendingVisits: [],
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

  fetchAudioPackages: async (query) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (query) {
        Object.entries(query).forEach(([k, v]) => v && params.append(k, v))
      }
      const data = await api.get('/audio-packages', { params })
      set({ audioPackages: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchAudioPackage: async (id) => {
    try {
      const data = await api.get(`/audio-packages/${id}`)
      const pkg = (data as any).data || (data as any)
      set({ currentAudioPackage: pkg })
      return pkg
    } catch {}
  },

  fetchPackageItems: async (packageId) => {
    try {
      const data = await api.get(`/audio-packages/${packageId}/items`)
      set({ packageItems: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchPackageFeedback: async (packageId) => {
    try {
      const data = await api.get(`/audio-packages/${packageId}/feedback`)
      set({ packageFeedback: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchPackageFollowUps: async (packageId) => {
    try {
      const data = await api.get(`/audio-packages/${packageId}/follow-ups`)
      set({ packageFollowUps: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchStampAudioPackages: async (stampId) => {
    try {
      const data = await api.get(`/audio-packages/stamps/${stampId}/audio-packages`)
      set({ stampAudioPackages: (data as any).data || (data as any) || [] })
    } catch {}
  },

  createAudioPackage: async (data) => {
    try {
      const result = await api.post('/audio-packages', data)
      const pkg = (result as any).data || (result as any)
      set({ audioPackages: [...get().audioPackages, pkg] })
      return pkg
    } catch {}
  },

  updateAudioPackage: async (id, data) => {
    try {
      const result = await api.put(`/audio-packages/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({
        audioPackages: get().audioPackages.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        currentAudioPackage: get().currentAudioPackage?.id === id ? { ...get().currentAudioPackage, ...updated } : get().currentAudioPackage,
      })
    } catch {}
  },

  deleteAudioPackage: async (id) => {
    try {
      await api.delete(`/audio-packages/${id}`)
      set({
        audioPackages: get().audioPackages.filter((p) => p.id !== id),
        currentAudioPackage: get().currentAudioPackage?.id === id ? null : get().currentAudioPackage,
      })
    } catch {}
  },

  addPackageItem: async (packageId, data) => {
    try {
      const result = await api.post(`/audio-packages/${packageId}/items`, data)
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageItems: pkg?.items || [],
      })
      get().fetchAudioPackages()
    } catch {}
  },

  updatePackageItem: async (packageId, itemId, data) => {
    try {
      const result = await api.put(`/audio-packages/${packageId}/items/${itemId}`, data)
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageItems: pkg?.items || [],
      })
    } catch {}
  },

  updatePackageItemStatus: async (packageId, itemId, status) => {
    try {
      const result = await api.put(`/audio-packages/${packageId}/items/${itemId}/status`, { status })
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageItems: pkg?.items || [],
      })
      get().fetchAudioPackages()
    } catch {}
  },

  removePackageItem: async (packageId, itemId) => {
    try {
      const result = await api.delete(`/audio-packages/${packageId}/items/${itemId}`)
      get().fetchAudioPackage(packageId)
      get().fetchAudioPackages()
      return !!(result as any)
    } catch {
      return false
    }
  },

  addPackageFeedback: async (packageId, data) => {
    try {
      const result = await api.post(`/audio-packages/${packageId}/feedback`, data)
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageFeedback: pkg?.feedback || [],
      })
    } catch {}
  },

  removePackageFeedback: async (packageId, feedbackId) => {
    try {
      const result = await api.delete(`/audio-packages/${packageId}/feedback/${feedbackId}`)
      get().fetchAudioPackage(packageId)
      return !!(result as any)
    } catch {
      return false
    }
  },

  addPackageFollowUp: async (packageId, data) => {
    try {
      const result = await api.post(`/audio-packages/${packageId}/follow-ups`, data)
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageFollowUps: pkg?.followUps || [],
      })
    } catch {}
  },

  updatePackageFollowUp: async (packageId, followUpId, data) => {
    try {
      const result = await api.put(`/audio-packages/${packageId}/follow-ups/${followUpId}`, data)
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageFollowUps: pkg?.followUps || [],
      })
    } catch {}
  },

  updatePackageFollowUpStatus: async (packageId, followUpId, status) => {
    try {
      const result = await api.put(`/audio-packages/${packageId}/follow-ups/${followUpId}/status`, { status })
      const pkg = (result as any).data || (result as any)
      set({
        currentAudioPackage: pkg,
        packageFollowUps: pkg?.followUps || [],
      })
    } catch {}
  },

  removePackageFollowUp: async (packageId, followUpId) => {
    try {
      const result = await api.delete(`/audio-packages/${packageId}/follow-ups/${followUpId}`)
      get().fetchAudioPackage(packageId)
      return !!(result as any)
    } catch {
      return false
    }
  },

  setCurrentAudioPackage: (pkg) => {
    set({ currentAudioPackage: pkg })
  },

  fetchExplanations: async (query) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (query) {
        Object.entries(query).forEach(([k, v]) => v && params.append(k, v))
      }
      const data = await api.get('/explanations', { params })
      set({ explanations: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchPendingVisits: async (query) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams()
      if (query) {
        Object.entries(query).forEach(([k, v]) => v && params.append(k, v))
      }
      const data = await api.get('/explanations/pending-visits', { params })
      set({ pendingVisits: (data as any).data || (data as any) || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchExplanation: async (id) => {
    try {
      const data = await api.get(`/explanations/${id}`)
      const exp = (data as any).data || (data as any)
      set({
        currentExplanation: exp,
        explanationStamps: exp?.stamps || [],
        explanationFeedback: exp?.feedback || [],
        explanationFollowUps: exp?.followUps || [],
        explanationVisits: exp?.visits || [],
      })
      return exp
    } catch {}
  },

  fetchExplanationStamps: async (explanationId) => {
    try {
      const data = await api.get(`/explanations/${explanationId}/stamps`)
      set({ explanationStamps: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchExplanationFeedback: async (explanationId) => {
    try {
      const data = await api.get(`/explanations/${explanationId}/feedback`)
      set({ explanationFeedback: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchExplanationFollowUps: async (explanationId) => {
    try {
      const data = await api.get(`/explanations/${explanationId}/follow-ups`)
      set({ explanationFollowUps: (data as any).data || (data as any) || [] })
    } catch {}
  },

  fetchExplanationVisits: async (explanationId) => {
    try {
      const data = await api.get(`/explanations/${explanationId}/visits`)
      set({ explanationVisits: (data as any).data || (data as any) || [] })
    } catch {}
  },

  createExplanation: async (data) => {
    try {
      const result = await api.post('/explanations', data)
      const exp = (result as any).data || (result as any)
      set({ explanations: [...get().explanations, exp] })
      return exp
    } catch {}
  },

  updateExplanation: async (id, data) => {
    try {
      const result = await api.put(`/explanations/${id}`, data)
      const updated = (result as any).data || (result as any)
      set({
        explanations: get().explanations.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        currentExplanation: get().currentExplanation?.id === id ? { ...get().currentExplanation, ...updated } : get().currentExplanation,
      })
    } catch {}
  },

  deleteExplanation: async (id) => {
    try {
      await api.delete(`/explanations/${id}`)
      set({
        explanations: get().explanations.filter((e) => e.id !== id),
        currentExplanation: get().currentExplanation?.id === id ? null : get().currentExplanation,
      })
    } catch {}
  },

  updateExplanationStatus: async (id, status) => {
    try {
      const result = await api.put(`/explanations/${id}/status`, { status })
      const updated = (result as any).data || (result as any)
      set({
        explanations: get().explanations.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        currentExplanation: get().currentExplanation?.id === id ? { ...get().currentExplanation, ...updated } : get().currentExplanation,
      })
    } catch {}
  },

  addExplanationStamp: async (explanationId, data) => {
    try {
      const result = await api.post(`/explanations/${explanationId}/stamps`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationStamps: exp?.stamps || [],
      })
      get().fetchExplanations()
    } catch {}
  },

  updateExplanationStamp: async (explanationId, stampId, data) => {
    try {
      const result = await api.put(`/explanations/${explanationId}/stamps/${stampId}`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationStamps: exp?.stamps || [],
      })
    } catch {}
  },

  removeExplanationStamp: async (explanationId, stampId) => {
    try {
      const result = await api.delete(`/explanations/${explanationId}/stamps/${stampId}`)
      get().fetchExplanation(explanationId)
      get().fetchExplanations()
      return !!(result as any)
    } catch {
      return false
    }
  },

  addExplanationFeedback: async (explanationId, data) => {
    try {
      const result = await api.post(`/explanations/${explanationId}/feedback`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationFeedback: exp?.feedback || [],
      })
    } catch {}
  },

  removeExplanationFeedback: async (explanationId, feedbackId) => {
    try {
      const result = await api.delete(`/explanations/${explanationId}/feedback/${feedbackId}`)
      get().fetchExplanation(explanationId)
      return !!(result as any)
    } catch {
      return false
    }
  },

  convertFeedbackToFollowUp: async (explanationId, feedbackId, data) => {
    try {
      const result = await api.post(`/explanations/${explanationId}/feedback/${feedbackId}/convert-follow-up`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationFollowUps: exp?.followUps || [],
      })
    } catch {}
  },

  appendFeedbackToStory: async (explanationId, feedbackId, data) => {
    try {
      const result = await api.post(`/explanations/${explanationId}/feedback/${feedbackId}/append-story`, data || {})
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
      })
      get().fetchStories()
    } catch {}
  },

  addExplanationFollowUp: async (explanationId, data) => {
    try {
      const result = await api.post(`/explanations/${explanationId}/follow-ups`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationFollowUps: exp?.followUps || [],
      })
    } catch {}
  },

  updateExplanationFollowUp: async (explanationId, followUpId, data) => {
    try {
      const result = await api.put(`/explanations/${explanationId}/follow-ups/${followUpId}`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationFollowUps: exp?.followUps || [],
      })
    } catch {}
  },

  updateExplanationFollowUpStatus: async (explanationId, followUpId, status) => {
    try {
      const result = await api.put(`/explanations/${explanationId}/follow-ups/${followUpId}/status`, { status })
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationFollowUps: exp?.followUps || [],
      })
    } catch {}
  },

  removeExplanationFollowUp: async (explanationId, followUpId) => {
    try {
      const result = await api.delete(`/explanations/${explanationId}/follow-ups/${followUpId}`)
      get().fetchExplanation(explanationId)
      return !!(result as any)
    } catch {
      return false
    }
  },

  addExplanationVisit: async (explanationId, data) => {
    try {
      const result = await api.post(`/explanations/${explanationId}/visits`, data)
      const exp = (result as any).data || (result as any)
      set({
        currentExplanation: exp,
        explanationVisits: exp?.visits || [],
      })
      get().fetchExplanations()
      get().fetchPendingVisits()
    } catch {}
  },

  setCurrentExplanation: (exp) => {
    set({ currentExplanation: exp })
  },
}))

export default useStore
