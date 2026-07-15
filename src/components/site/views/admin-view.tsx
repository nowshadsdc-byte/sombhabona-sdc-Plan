'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAppStore, type SafeAdmin } from '@/store/app-store'
import { api, formatDate, formatUSD, formatBDT, timeAgo } from '@/lib/api'
import {
  ColorAvatar,
  StatusBadge,
  EmptyState,
  LoadingBlock,
  StatCard,
} from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  LogOut,
  Lock,
  Mail,
  Plus,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  Heart,
  Sparkles,
  Package as PackageIcon,
  FileText,
  Settings,
  LayoutDashboard,
  DollarSign,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'

/* ------------------------- Types ------------------------- */
interface AdminStats {
  childrenCount: number
  womenCount: number
  totalDonors: number
  donorsCount: number
  donationsCount: number
  completedDonations: number
  pendingDonations: number
  totalRaisedUSD: number
  totalRaisedBDT: number
  childrenSupported: number
  womenSupported: number
  availableChildren: number
  availableWomen: number
}

interface Child {
  id: string
  name: string
  age: number
  gender: string
  grade: string
  school: string
  location: string
  background: string
  dream: string
  photoColor: string
  status: string
  progressPercent: number
  createdAt: string
}
interface Woman {
  id: string
  name: string
  age: number
  location: string
  familyInfo: string
  background: string
  goal: string
  photoColor: string
  status: string
  progressPercent: number
  createdAt: string
}
interface AdminDonor {
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
  donationsCount?: number
}
interface AdminDonation {
  id: string
  createdAt: string
  amountUSD: number
  amountBDT: number
  paymentMethod: string
  paymentStatus: string
  transactionId?: string | null
  anonymous: boolean
  donor: { id: string; name: string }
  child?: { id: string; name: string } | null
  woman?: { id: string; name: string } | null
}
interface AdminProgress {
  id: string
  childId?: string | null
  womanId?: string | null
  title: string
  content: string
  photoColor: string
  milestone: boolean
  createdAt: string
  child?: { id: string; name: string } | null
  woman?: { id: string; name: string } | null
}
interface PackageItem {
  id: string
  name: string
  description: string
  priceUSD: number
  priceBDT: number
  childBenefit: string
  womanBenefit: string
  imageColor: string
  active: boolean
  createdAt: string
}

const PALETTE = [
  '#0d9488', '#14b8a6', '#f59e0b', '#f97316',
  '#ec4899', '#e11d48', '#84cc16', '#ca8a04',
  '#be185d', '#d97706',
]

type SectionId =
  | 'overview'
  | 'children'
  | 'women'
  | 'donors'
  | 'donations'
  | 'progress'
  | 'packages'
  | 'content'

const SECTIONS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'children', label: 'Children', icon: GraduationCap },
  { id: 'women', label: 'Women', icon: Users },
  { id: 'donors', label: 'Donors', icon: Heart },
  { id: 'donations', label: 'Donations', icon: DollarSign },
  { id: 'progress', label: 'Progress', icon: Sparkles },
  { id: 'packages', label: 'Packages', icon: PackageIcon },
  { id: 'content', label: 'Site content', icon: FileText },
]

/* ------------------------- Main view ------------------------- */
export function AdminView() {
  const admin = useAppStore((s) => s.admin)
  const authLoaded = useAppStore((s) => s.authLoaded)
  const authLoading = useAppStore((s) => s.authLoading)

  if (!authLoaded || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <LoadingBlock label="Loading admin console…" />
      </div>
    )
  }
  return admin ? <AdminDashboard admin={admin} /> : <AdminLogin />
}

/* ============================ LOGIN ============================ */
function AdminLogin() {
  const refreshAuth = useAppStore((s) => s.refreshAuth)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }
    setLoading(true)
    try {
      await api<{ admin: SafeAdmin }>('/api/auth/admin/login', {
        method: 'POST',
        json: { email, password },
      })
      await refreshAuth()
      toast.success('Welcome, admin')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-soft">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Shield className="h-7 w-7" />
            </div>
            <CardTitle className="mt-4 text-xl">Admin Console</CardTitle>
            <CardDescription>Sign in to manage the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <FormField label="Email" icon={Mail}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@odctl.org"
                  required
                />
              </FormField>
              <FormField label="Password" icon={Lock}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={loading}>
                <Shield className="h-4 w-4" />
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">Demo admin:</span>{' '}
              admin@odctl.org / admin123
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

/* ============================ DASHBOARD ============================ */
function AdminDashboard({ admin }: { admin: SafeAdmin }) {
  const refreshAuth = useAppStore((s) => s.refreshAuth)
  const go = useAppStore((s) => s.go)
  const [section, setSection] = React.useState<SectionId>('overview')
  const [signingOut, setSigningOut] = React.useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await api('/api/auth/logout', { method: 'POST' })
      await refreshAuth()
      toast.success('Signed out')
      go('home')
    } catch {
      toast.error('Could not sign out')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Admin Console</p>
            <p className="text-xs text-muted-foreground">
              {admin.name} · {admin.email}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      {/* Mobile section selector */}
      <div className="mt-4 lg:hidden">
        <Select value={section} onValueChange={(v) => setSection(v as SectionId)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <s.icon className="h-3.5 w-3.5" /> {s.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
            {SECTIONS.map((s) => {
              const active = section === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ' +
                    (active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground')
                  }
                >
                  <s.icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Section content */}
        <div className="min-w-0">
          {section === 'overview' && <OverviewSection />}
          {section === 'children' && <ChildrenSection />}
          {section === 'women' && <WomenSection />}
          {section === 'donors' && <DonorsSection />}
          {section === 'donations' && <DonationsSection />}
          {section === 'progress' && <ProgressSection />}
          {section === 'packages' && <PackagesSection />}
          {section === 'content' && <ContentSection />}
        </div>
      </div>
    </section>
  )
}

/* ------------------------- Shared form bits ------------------------- */
function FormField({
  label,
  icon: Icon,
  children,
  hint,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Select color ${c}`}
          className={
            'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ' +
            (value === c ? 'border-foreground ring-2 ring-primary/40' : 'border-background')
          }
          style={{ background: c }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded-full border-2 border-border bg-transparent p-0"
        aria-label="Custom color"
      />
    </div>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="max-h-[70vh] overflow-auto custom-scrollbar">{children}</div>
    </div>
  )
}

/* ------------------------- Confirm delete dialog ------------------------- */
function ConfirmDelete({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ============================ OVERVIEW ============================ */
function OverviewSection() {
  const [stats, setStats] = React.useState<AdminStats | null>(null)
  const [donations, setDonations] = React.useState<AdminDonation[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      api<AdminStats>('/api/admin/stats').catch(() => null),
      api<AdminDonation[]>('/api/admin/donations').catch(() => [] as AdminDonation[]),
    ]).then(([s, d]) => {
      setStats(s)
      setDonations(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingBlock label="Loading overview…" />
  if (!stats) {
    return (
      <EmptyState
        icon={Settings}
        title="Couldn't load stats"
        description="Please make sure you're signed in as admin."
      />
    )
  }

  // last 6 months donation chart
  const now = new Date()
  const months: { key: string; label: string; count: number; total: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('en-US', { month: 'short' }),
      count: 0,
      total: 0,
    })
  }
  donations.forEach((d) => {
    const dt = new Date(d.createdAt)
    const key = `${dt.getFullYear()}-${dt.getMonth()}`
    const m = months.find((x) => x.key === key)
    if (m) {
      m.count++
      m.total += d.amountUSD || 0
    }
  })

  return (
    <div>
      <SectionHeader
        title="Overview"
        description="A snapshot of the platform's reach and impact."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats.childrenCount} label="Children" icon={GraduationCap} accent="#14b8a6" />
        <StatCard value={stats.womenCount} label="Women" icon={Users} accent="#ec4899" />
        <StatCard value={stats.donorsCount ?? stats.totalDonors} label="Donors" icon={Heart} accent="#0d9488" />
        <StatCard value={stats.donationsCount} label="Donations" icon={DollarSign} accent="#f59e0b" />
        <StatCard value={stats.completedDonations} label="Completed" icon={CheckCircle2} accent="#14b8a6" />
        <StatCard value={stats.pendingDonations} label="Pending" icon={Sparkles} accent="#ca8a04" />
        <StatCard value={formatUSD(stats.totalRaisedUSD)} label="Raised (USD)" icon={DollarSign} accent="#0d9488" />
        <StatCard value={`৳${Math.round(stats.totalRaisedBDT || 0).toLocaleString()}`} label="Raised (BDT)" icon={DollarSign} accent="#f97316" />
      </div>

      {/* Secondary stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats.childrenSupported} label="Children supported" accent="#14b8a6" />
        <StatCard value={stats.womenSupported} label="Women supported" accent="#ec4899" />
        <StatCard value={stats.availableChildren} label="Available children" accent="#84cc16" />
        <StatCard value={stats.availableWomen} label="Available women" accent="#d97706" />
      </div>

      {/* Chart */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Donations — last 6 months
          </CardTitle>
          <CardDescription>Count of donations received each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 75)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 60)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="oklch(0.5 0.02 60)" />
                <Tooltip
                  cursor={{ fill: 'oklch(0.46 0.09 180 / 0.08)' }}
                  contentStyle={{
                    background: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.9 0.015 75)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="oklch(0.46 0.09 180)" radius={[6, 6, 0, 0]} name="Donations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ============================ CHILDREN ============================ */
function ChildrenSection() {
  const [items, setItems] = React.useState<Child[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<Child | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<Child | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<Child[]>('/api/admin/children')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load children')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api(`/api/admin/children/${deleting.id}`, { method: 'DELETE' })
      toast.success('Child deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Children"
        description="Manage the children awaiting or receiving sponsorship."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add child
          </Button>
        }
      />
      {loading ? (
        <LoadingBlock label="Loading children…" />
      ) : items.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No children yet" description="Add your first child beneficiary." />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ColorAvatar name={c.name} color={c.photoColor} size={28} />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{c.age}</TableCell>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell className="text-muted-foreground">{c.location}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${c.progressPercent}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{c.progressPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleting(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      {(creating || editing) && (
        <ChildDialog
          child={editing}
          open={true}
          onOpenChange={(o) => {
            if (!o) {
              setCreating(false)
              setEditing(null)
            }
          }}
          onSaved={() => {
            setCreating(false)
            setEditing(null)
            load()
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete child?"
        description={`This will permanently remove ${deleting?.name ?? ''} and unlink any donations. This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

function ChildDialog({
  child,
  open,
  onOpenChange,
  onSaved,
}: {
  child: Child | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState(() => emptyChild(child))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) setForm(emptyChild(child))
  }, [open, child])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.grade || !form.location) {
      toast.error('Name, grade and location are required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, age: Number(form.age) || 0 }
      if (child) {
        await api(`/api/admin/children/${child.id}`, { method: 'PUT', json: payload })
        toast.success('Child updated')
      } else {
        await api('/api/admin/children', { method: 'POST', json: payload })
        toast.success('Child created')
      }
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{child ? 'Edit child' : 'Add child'}</DialogTitle>
          <DialogDescription>{child ? `Update details for ${child.name}` : 'Create a new child beneficiary'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Name">
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </FormField>
            <FormField label="Age">
              <Input type="number" min={0} max={25} value={form.age} onChange={(e) => update('age', e.target.value)} />
            </FormField>
            <FormField label="Gender">
              <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Grade">
              <Input value={form.grade} onChange={(e) => update('grade', e.target.value)} required />
            </FormField>
            <FormField label="School">
              <Input value={form.school} onChange={(e) => update('school', e.target.value)} />
            </FormField>
            <FormField label="Location">
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} required />
            </FormField>
          </div>
          <FormField label="Background">
            <Textarea rows={3} value={form.background} onChange={(e) => update('background', e.target.value)} />
          </FormField>
          <FormField label="Dream">
            <Input value={form.dream} onChange={(e) => update('dream', e.target.value)} placeholder="e.g. to become a doctor" />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Status">
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="SUPPORTED">Supported</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={`Progress: ${form.progressPercent}%`}>
              <Slider
                value={[form.progressPercent]}
                onValueChange={(v) => update('progressPercent', v[0] ?? 0)}
                min={0}
                max={100}
                step={1}
              />
            </FormField>
          </div>
          <FormField label="Photo color">
            <ColorPicker value={form.photoColor} onChange={(c) => update('photoColor', c)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : child ? 'Save changes' : 'Create child'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function emptyChild(c: Child | null) {
  return {
    name: c?.name ?? '',
    age: c?.age?.toString() ?? '8',
    gender: c?.gender ?? 'female',
    grade: c?.grade ?? '',
    school: c?.school ?? '',
    location: c?.location ?? '',
    background: c?.background ?? '',
    dream: c?.dream ?? '',
    photoColor: c?.photoColor ?? '#f59e0b',
    status: c?.status ?? 'AVAILABLE',
    progressPercent: c?.progressPercent ?? 0,
  }
}

/* ============================ WOMEN ============================ */
function WomenSection() {
  const [items, setItems] = React.useState<Woman[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<Woman | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<Woman | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<Woman[]>('/api/admin/women')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load women')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api(`/api/admin/women/${deleting.id}`, { method: 'DELETE' })
      toast.success('Woman deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Women"
        description="Manage the women enrolled in caregiver training."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add woman
          </Button>
        }
      />
      {loading ? (
        <LoadingBlock label="Loading women…" />
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No women yet" description="Add your first woman beneficiary." />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ColorAvatar name={w.name} color={w.photoColor} size={28} />
                      <span className="font-medium">{w.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{w.age}</TableCell>
                  <TableCell className="text-muted-foreground">{w.location}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[14rem] truncate">{w.goal}</TableCell>
                  <TableCell><StatusBadge status={w.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${w.progressPercent}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{w.progressPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(w)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleting(w)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      {(creating || editing) && (
        <WomanDialog
          woman={editing}
          open={true}
          onOpenChange={(o) => {
            if (!o) {
              setCreating(false)
              setEditing(null)
            }
          }}
          onSaved={() => {
            setCreating(false)
            setEditing(null)
            load()
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete woman?"
        description={`This will permanently remove ${deleting?.name ?? ''} and unlink any donations. This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

function WomanDialog({
  woman,
  open,
  onOpenChange,
  onSaved,
}: {
  woman: Woman | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState(() => emptyWoman(woman))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) setForm(emptyWoman(woman))
  }, [open, woman])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.location) {
      toast.error('Name and location are required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, age: Number(form.age) || 0 }
      if (woman) {
        await api(`/api/admin/women/${woman.id}`, { method: 'PUT', json: payload })
        toast.success('Woman updated')
      } else {
        await api('/api/admin/women', { method: 'POST', json: payload })
        toast.success('Woman created')
      }
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{woman ? 'Edit woman' : 'Add woman'}</DialogTitle>
          <DialogDescription>{woman ? `Update details for ${woman.name}` : 'Create a new woman beneficiary'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Name">
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </FormField>
            <FormField label="Age">
              <Input type="number" min={18} max={70} value={form.age} onChange={(e) => update('age', e.target.value)} />
            </FormField>
            <FormField label="Location">
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} required />
            </FormField>
            <FormField label="Family info">
              <Input value={form.familyInfo} onChange={(e) => update('familyInfo', e.target.value)} placeholder="e.g. Mother of 2" />
            </FormField>
          </div>
          <FormField label="Background">
            <Textarea rows={3} value={form.background} onChange={(e) => update('background', e.target.value)} />
          </FormField>
          <FormField label="Goal">
            <Input value={form.goal} onChange={(e) => update('goal', e.target.value)} placeholder="e.g. Become a certified caregiver" />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Status">
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="SUPPORTED">Supported</SelectItem>
                  <SelectItem value="EMPLOYED">Employed</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={`Progress: ${form.progressPercent}%`}>
              <Slider
                value={[form.progressPercent]}
                onValueChange={(v) => update('progressPercent', v[0] ?? 0)}
                min={0}
                max={100}
                step={1}
              />
            </FormField>
          </div>
          <FormField label="Photo color">
            <ColorPicker value={form.photoColor} onChange={(c) => update('photoColor', c)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : woman ? 'Save changes' : 'Create woman'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function emptyWoman(w: Woman | null) {
  return {
    name: w?.name ?? '',
    age: w?.age?.toString() ?? '28',
    location: w?.location ?? '',
    familyInfo: w?.familyInfo ?? '',
    background: w?.background ?? '',
    goal: w?.goal ?? '',
    photoColor: w?.photoColor ?? '#ec4899',
    status: w?.status ?? 'AVAILABLE',
    progressPercent: w?.progressPercent ?? 0,
  }
}

/* ============================ DONORS ============================ */
function DonorsSection() {
  const [items, setItems] = React.useState<AdminDonor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<AdminDonor | null>(null)
  const [deleting, setDeleting] = React.useState<AdminDonor | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<AdminDonor[]>('/api/admin/donors')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load donors')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api(`/api/admin/donors/${deleting.id}`, { method: 'DELETE' })
      toast.success('Donor deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader title="Donors" description="Manage registered donor accounts." />
      {loading ? (
        <LoadingBlock label="Loading donors…" />
      ) : items.length === 0 ? (
        <EmptyState icon={Heart} title="No donors yet" description="Donors will appear here once they register." />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Public?</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ColorAvatar name={d.name} color={d.avatarColor} size={28} />
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[d.city, d.country].filter(Boolean).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    {d.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><Eye className="h-3 w-3" /> Yes</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><EyeOff className="h-3 w-3" /> No</span>
                    )}
                  </TableCell>
                  <TableCell>{d.donationsCount ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(d.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(d)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleting(d)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      {editing && (
        <DonorDialog
          donor={editing}
          open={true}
          onOpenChange={(o) => !o && setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete donor?"
        description={`This will permanently remove ${deleting?.name ?? ''} and may orphan their donations. This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

function DonorDialog({
  donor,
  open,
  onOpenChange,
  onSaved,
}: {
  donor: AdminDonor
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState(() => ({
    name: donor.name,
    email: donor.email,
    phone: donor.phone ?? '',
    country: donor.country ?? '',
    city: donor.city ?? '',
    bio: donor.bio ?? '',
    avatarColor: donor.avatarColor,
    isPublic: donor.isPublic,
    newPassword: '',
  }))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setForm({
        name: donor.name,
        email: donor.email,
        phone: donor.phone ?? '',
        country: donor.country ?? '',
        city: donor.city ?? '',
        bio: donor.bio ?? '',
        avatarColor: donor.avatarColor,
        isPublic: donor.isPublic,
        newPassword: '',
      })
    }
  }, [open, donor])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        country: form.country || null,
        city: form.city || null,
        bio: form.bio || null,
        avatarColor: form.avatarColor,
        isPublic: form.isPublic,
      }
      if (form.newPassword) {
        if (form.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters')
          setSaving(false)
          return
        }
        payload.password = form.newPassword
      }
      await api(`/api/admin/donors/${donor.id}`, { method: 'PUT', json: payload })
      toast.success('Donor updated')
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit donor</DialogTitle>
          <DialogDescription>{`Update details for ${donor.name}`}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Name">
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </FormField>
            <FormField label="Phone">
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </FormField>
            <FormField label="City">
              <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
            </FormField>
            <FormField label="Country">
              <Input value={form.country} onChange={(e) => update('country', e.target.value)} />
            </FormField>
            <FormField label="New password (optional)" hint="Leave blank to keep current">
              <Input type="password" value={form.newPassword} onChange={(e) => update('newPassword', e.target.value)} placeholder="••••••••" />
            </FormField>
          </div>
          <FormField label="Bio">
            <Textarea rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
          </FormField>
          <FormField label="Avatar color">
            <ColorPicker value={form.avatarColor} onChange={(c) => update('avatarColor', c)} />
          </FormField>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Switch checked={form.isPublic} onCheckedChange={(v) => update('isPublic', v)} id="d-pub" />
            <Label htmlFor="d-pub" className="cursor-pointer">
              <span className="font-medium">Public profile</span>
              <span className="block text-xs text-muted-foreground">If on, this donor appears in the public donor list.</span>
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ============================ DONATIONS ============================ */
function DonationsSection() {
  const [items, setItems] = React.useState<AdminDonation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<AdminDonation | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<AdminDonation[]>('/api/admin/donations')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load donations')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <SectionHeader title="Donations" description="Review and update donation statuses." />
      {loading ? (
        <LoadingBlock label="Loading donations…" />
      ) : items.length === 0 ? (
        <EmptyState icon={DollarSign} title="No donations yet" description="Donations will appear here once they're made." />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Woman</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    {d.anonymous ? <span className="text-muted-foreground italic">Anonymous</span> : d.donor?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.child?.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{d.woman?.name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="font-medium">{formatUSD(d.amountUSD)}</div>
                    <div className="text-xs text-muted-foreground">{formatBDT(d.amountBDT)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={d.paymentStatus} /></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{d.transactionId || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(d)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      {editing && (
        <DonationDialog
          donation={editing}
          open={true}
          onOpenChange={(o) => !o && setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function DonationDialog({
  donation,
  open,
  onOpenChange,
  onSaved,
}: {
  donation: AdminDonation
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [status, setStatus] = React.useState(donation.paymentStatus)
  const [transactionId, setTransactionId] = React.useState(donation.transactionId ?? '')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setStatus(donation.paymentStatus)
      setTransactionId(donation.transactionId ?? '')
    }
  }, [open, donation])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api(`/api/admin/donations/${donation.id}`, {
        method: 'PUT',
        json: { paymentStatus: status, transactionId: transactionId || null },
      })
      toast.success('Donation updated')
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit donation</DialogTitle>
          <DialogDescription>
            {formatUSD(donation.amountUSD)} · {donation.donor?.name ?? 'Anonymous'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Payment status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Transaction ID">
            <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Optional" />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ============================ PROGRESS UPDATES ============================ */
function ProgressSection() {
  const [items, setItems] = React.useState<AdminProgress[]>([])
  const [children, setChildren] = React.useState<Child[]>([])
  const [women, setWomen] = React.useState<Woman[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<AdminProgress | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<AdminProgress | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [data, c, w] = await Promise.all([
        api<AdminProgress[]>('/api/admin/progress').catch(() => [] as AdminProgress[]),
        api<Child[]>('/api/admin/children').catch(() => [] as Child[]),
        api<Woman[]>('/api/admin/women').catch(() => [] as Woman[]),
      ])
      setItems(Array.isArray(data) ? data : [])
      setChildren(Array.isArray(c) ? c : [])
      setWomen(Array.isArray(w) ? w : [])
    } catch {
      toast.error('Could not load progress updates')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api(`/api/admin/progress/${deleting.id}`, { method: 'DELETE' })
      toast.success('Update deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Progress updates"
        description="Post updates on children and women for their sponsors to see."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add update
          </Button>
        }
      />
      {loading ? (
        <LoadingBlock label="Loading updates…" />
      ) : items.length === 0 ? (
        <EmptyState icon={Sparkles} title="No updates yet" description="Post your first progress update." />
      ) : (
        <div className="space-y-3">
          {items
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((u) => {
              const beneficiary = u.child?.name || u.woman?.name || '—'
              return (
                <div key={u.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: `${u.photoColor}22`, color: u.photoColor }}
                  >
                    {u.milestone ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{u.title}</span>
                      {u.milestone && (
                        <Badge className="bg-primary/10 text-primary border-0">Milestone</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{beneficiary}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{timeAgo(u.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{u.content}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleting(u)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {(creating || editing) && (
        <ProgressDialog
          progress={editing}
          childOptions={children}
          womanOptions={women}
          open={true}
          onOpenChange={(o) => {
            if (!o) {
              setCreating(false)
              setEditing(null)
            }
          }}
          onSaved={() => {
            setCreating(false)
            setEditing(null)
            load()
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete update?"
        description="This will permanently remove this progress update. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

function ProgressDialog({
  progress,
  childOptions,
  womanOptions,
  open,
  onOpenChange,
  onSaved,
}: {
  progress: AdminProgress | null
  childOptions: Child[]
  womanOptions: Woman[]
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [type, setType] = React.useState<'CHILD' | 'WOMAN'>(progress?.childId ? 'CHILD' : 'WOMAN')
  const [childId, setChildId] = React.useState(progress?.childId ?? '')
  const [womanId, setWomanId] = React.useState(progress?.womanId ?? '')
  const [title, setTitle] = React.useState(progress?.title ?? '')
  const [content, setContent] = React.useState(progress?.content ?? '')
  const [photoColor, setPhotoColor] = React.useState(progress?.photoColor ?? '#14b8a6')
  const [milestone, setMilestone] = React.useState(progress?.milestone ?? false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setType(progress?.childId ? 'CHILD' : 'WOMAN')
      setChildId(progress?.childId ?? '')
      setWomanId(progress?.womanId ?? '')
      setTitle(progress?.title ?? '')
      setContent(progress?.content ?? '')
      setPhotoColor(progress?.photoColor ?? '#14b8a6')
      setMilestone(progress?.milestone ?? false)
    }
  }, [open, progress])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !content) {
      toast.error('Title and content are required')
      return
    }
    if (type === 'CHILD' && !childId) {
      toast.error('Pick a child')
      return
    }
    if (type === 'WOMAN' && !womanId) {
      toast.error('Pick a woman')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title,
        content,
        photoColor,
        milestone,
        childId: type === 'CHILD' ? childId : null,
        womanId: type === 'WOMAN' ? womanId : null,
      }
      if (progress) {
        await api(`/api/admin/progress/${progress.id}`, { method: 'PUT', json: payload })
        toast.success('Update saved')
      } else {
        await api('/api/admin/progress', { method: 'POST', json: payload })
        toast.success('Update posted')
      }
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{progress ? 'Edit progress update' : 'Add progress update'}</DialogTitle>
          <DialogDescription>Share news with sponsors about a child or woman.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Beneficiary type">
            <Select value={type} onValueChange={(v) => setType(v as 'CHILD' | 'WOMAN')}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CHILD">Child</SelectItem>
                <SelectItem value="WOMAN">Woman</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          {type === 'CHILD' ? (
            <FormField label="Child">
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Pick a child" /></SelectTrigger>
                <SelectContent>
                  {childOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : (
            <FormField label="Woman">
              <Select value={womanId} onValueChange={setWomanId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Pick a woman" /></SelectTrigger>
                <SelectContent>
                  {womanOptions.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
          <FormField label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Passed mid-term exams" required />
          </FormField>
          <FormField label="Content">
            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
          </FormField>
          <FormField label="Accent color">
            <ColorPicker value={photoColor} onChange={setPhotoColor} />
          </FormField>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Switch checked={milestone} onCheckedChange={setMilestone} id="p-milestone" />
            <Label htmlFor="p-milestone" className="cursor-pointer">
              <span className="font-medium">Mark as milestone</span>
              <span className="block text-xs text-muted-foreground">Milestones are highlighted to sponsors.</span>
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : progress ? 'Save changes' : 'Post update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ============================ PACKAGES ============================ */
function PackagesSection() {
  const [items, setItems] = React.useState<PackageItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<PackageItem | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [deleting, setDeleting] = React.useState<PackageItem | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<PackageItem[]>('/api/admin/packages')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load packages')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await api(`/api/admin/packages/${deleting.id}`, { method: 'DELETE' })
      toast.success('Package deleted')
      setDeleting(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Packages"
        description="Define sponsorship packages donors can choose from."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add package
          </Button>
        }
      />
      {loading ? (
        <LoadingBlock label="Loading packages…" />
      ) : items.length === 0 ? (
        <EmptyState icon={PackageIcon} title="No packages yet" description="Add your first sponsorship package." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => (
            <Card key={p.id} className="py-0 overflow-hidden">
              <div className="h-2" style={{ background: p.imageColor }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{p.name}</h3>
                      {p.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-primary">{formatUSD(p.priceUSD)}</div>
                    <div className="text-xs text-muted-foreground">{formatBDT(p.priceBDT)}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="font-semibold text-muted-foreground">Child benefit</div>
                    <div className="mt-0.5">{p.childBenefit}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="font-semibold text-muted-foreground">Woman benefit</div>
                    <div className="mt-0.5">{p.womanBenefit}</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleting(p)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <PackageDialog
          pkg={editing}
          open={true}
          onOpenChange={(o) => {
            if (!o) {
              setCreating(false)
              setEditing(null)
            }
          }}
          onSaved={() => {
            setCreating(false)
            setEditing(null)
            load()
          }}
        />
      )}

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete package?"
        description={`This will permanently remove "${deleting?.name ?? ''}". This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}

function PackageDialog({
  pkg,
  open,
  onOpenChange,
  onSaved,
}: {
  pkg: PackageItem | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState(() => emptyPackage(pkg))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) setForm(emptyPackage(pkg))
  }, [open, pkg])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.description) {
      toast.error('Name and description are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        priceUSD: Number(form.priceUSD) || 0,
        priceBDT: Number(form.priceBDT) || 0,
        childBenefit: form.childBenefit,
        womanBenefit: form.womanBenefit,
        imageColor: form.imageColor,
        active: form.active,
      }
      if (pkg) {
        await api(`/api/admin/packages/${pkg.id}`, { method: 'PUT', json: payload })
        toast.success('Package updated')
      } else {
        await api('/api/admin/packages', { method: 'POST', json: payload })
        toast.success('Package created')
      }
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{pkg ? 'Edit package' : 'Add package'}</DialogTitle>
          <DialogDescription>{pkg ? `Update details for ${pkg.name}` : 'Create a new sponsorship package'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name">
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </FormField>
          <FormField label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => update('description', e.target.value)} required />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Price (USD)">
              <Input type="number" min={0} step="0.01" value={form.priceUSD} onChange={(e) => update('priceUSD', e.target.value)} />
            </FormField>
            <FormField label="Price (BDT)">
              <Input type="number" min={0} step="0.01" value={form.priceBDT} onChange={(e) => update('priceBDT', e.target.value)} />
            </FormField>
            <FormField label="Child benefit">
              <Input value={form.childBenefit} onChange={(e) => update('childBenefit', e.target.value)} placeholder="e.g. 1 year of education" />
            </FormField>
            <FormField label="Woman benefit">
              <Input value={form.womanBenefit} onChange={(e) => update('womanBenefit', e.target.value)} placeholder="e.g. 3 months training" />
            </FormField>
          </div>
          <FormField label="Image color">
            <ColorPicker value={form.imageColor} onChange={(c) => update('imageColor', c)} />
          </FormField>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Switch checked={form.active} onCheckedChange={(v) => update('active', v)} id="pkg-active" />
            <Label htmlFor="pkg-active" className="cursor-pointer">
              <span className="font-medium">Active</span>
              <span className="block text-xs text-muted-foreground">Only active packages are shown to donors.</span>
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : pkg ? 'Save changes' : 'Create package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function emptyPackage(p: PackageItem | null) {
  return {
    name: p?.name ?? '',
    description: p?.description ?? '',
    priceUSD: p?.priceUSD?.toString() ?? '250',
    priceBDT: p?.priceBDT?.toString() ?? '30000',
    childBenefit: p?.childBenefit ?? '1 year of education',
    womanBenefit: p?.womanBenefit ?? '3 months caregiver training',
    imageColor: p?.imageColor ?? '#0d9488',
    active: p?.active ?? true,
  }
}

/* ============================ SITE CONTENT ============================ */
const CONTENT_GROUPS: { group: string; keys: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    group: 'Hero section',
    keys: [
      { key: 'heroBadge', label: 'Hero badge' },
      { key: 'heroTitle', label: 'Hero title', multiline: true },
      { key: 'heroSubtitle', label: 'Hero subtitle', multiline: true },
      { key: 'heroCta', label: 'Hero CTA button text' },
    ],
  },
  {
    group: 'About the organizations',
    keys: [
      { key: 'aboutOrg1Title', label: 'Org 1 title (Sombhabona)' },
      { key: 'aboutOrg1Body', label: 'Org 1 body', multiline: true },
      { key: 'aboutOrg2Title', label: 'Org 2 title (SDC)' },
      { key: 'aboutOrg2Body', label: 'Org 2 body', multiline: true },
    ],
  },
  {
    group: 'Joint initiative',
    keys: [
      { key: 'jointTitle', label: 'Joint title' },
      { key: 'jointBody', label: 'Joint body', multiline: true },
    ],
  },
  {
    group: 'Transparency',
    keys: [
      { key: 'transparencyTitle', label: 'Transparency title' },
      { key: 'transparencyBody', label: 'Transparency body', multiline: true },
    ],
  },
  {
    group: 'Package pricing',
    keys: [
      { key: 'packagePriceUSD', label: 'Package price (USD)' },
      { key: 'packagePriceBDT', label: 'Package price (BDT)' },
    ],
  },
  {
    group: 'Footer',
    keys: [
      { key: 'footerNote', label: 'Footer note', multiline: true },
    ],
  },
]

function ContentSection() {
  const loadContent = useAppStore((s) => s.loadContent)
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [savingKey, setSavingKey] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<Record<string, string>>('/api/admin/content')
      setValues(data ?? {})
    } catch {
      toast.error('Could not load site content')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function saveKey(key: string) {
    setSavingKey(key)
    try {
      await api('/api/admin/content', {
        method: 'PUT',
        json: { key, value: values[key] ?? '' },
      })
      toast.success('Saved')
      // refresh the public content cache so the rest of the site picks up changes
      await loadContent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) return <LoadingBlock label="Loading site content…" />

  return (
    <div>
      <SectionHeader
        title="Site content"
        description="Edit the marketing copy shown across the site. Save each field individually."
      />
      <div className="space-y-6">
        {CONTENT_GROUPS.map((group) => (
          <Card key={group.group}>
            <CardHeader>
              <CardTitle className="text-base">{group.group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.keys.map((k) => (
                <div key={k.key} className="space-y-1.5">
                  <Label className="flex items-center justify-between">
                    <span>{k.label}</span>
                    <span className="text-xs font-mono text-muted-foreground">{k.key}</span>
                  </Label>
                  {k.multiline ? (
                    <Textarea
                      rows={3}
                      value={values[k.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      value={values[k.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
                    />
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveKey(k.key)}
                      disabled={savingKey === k.key}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingKey === k.key ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
