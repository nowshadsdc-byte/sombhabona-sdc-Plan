import { create } from 'zustand'

export type View = 'home' | 'beneficiaries' | 'donate' | 'donor' | 'donors' | 'admin'

export interface SafeDonor {
  id: string
  name: string
  email: string
  phone?: string | null
  country?: string | null
  city?: string | null
  avatarColor: string
  bio?: string | null
  isPublic: boolean
  createdAt: string
}
export interface SafeAdmin {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

interface DonateSelection {
  childId?: string
  womanId?: string
  packageId?: string
}

interface SelectedBeneficiary {
  type: 'CHILD' | 'WOMAN'
  id: string
}

interface AppState {
  // navigation
  view: View
  setView: (v: View) => void
  go: (v: View) => void

  // donate flow
  donateSelection: DonateSelection
  setDonateSelection: (s: DonateSelection) => void

  // beneficiary detail modal
  selectedBeneficiary: SelectedBeneficiary | null
  openBeneficiary: (type: 'CHILD' | 'WOMAN', id: string) => void
  closeBeneficiary: () => void

  // auth
  donor: SafeDonor | null
  admin: SafeAdmin | null
  authLoading: boolean
  authLoaded: boolean
  refreshAuth: () => Promise<void>
  setAuth: (d: SafeDonor | null, a: SafeAdmin | null) => void

  // site content cache
  content: Record<string, string>
  contentLoaded: boolean
  loadContent: () => Promise<void>

  // toasts handled by sonner directly; nothing here
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  setView: (v) => set({ view: v }),
  go: (v) => {
    set({ view: v })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  donateSelection: {},
  setDonateSelection: (s) => set({ donateSelection: s }),

  selectedBeneficiary: null,
  openBeneficiary: (type, id) => set({ selectedBeneficiary: { type, id } }),
  closeBeneficiary: () => set({ selectedBeneficiary: null }),

  donor: null,
  admin: null,
  authLoading: false,
  authLoaded: false,
  setAuth: (donor, admin) => set({ donor, admin, authLoaded: true }),
  refreshAuth: async () => {
    set({ authLoading: true })
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      set({ donor: data.donor ?? null, admin: data.admin ?? null, authLoaded: true })
    } catch {
      set({ donor: null, admin: null, authLoaded: true })
    } finally {
      set({ authLoading: false })
    }
  },

  content: {},
  contentLoaded: false,
  loadContent: async () => {
    if (get().contentLoaded) return
    try {
      const res = await fetch('/api/content')
      const data = await res.json()
      set({ content: data, contentLoaded: true })
    } catch {
      set({ contentLoaded: true })
    }
  },
}))
