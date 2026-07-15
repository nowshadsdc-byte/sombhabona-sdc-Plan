'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type SafeDonor } from '@/store/app-store'
import { api, formatUSD, formatBDT, formatDate, timeAgo } from '@/lib/api'
import {
  ColorAvatar,
  StatusBadge,
  ProgressBlock,
  EmptyState,
  LoadingBlock,
  StatCard,
} from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Heart,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Globe,
  MapPin,
  Sparkles,
  GraduationCap,
  Users,
  DollarSign,
  ArrowRight,
  KeyRound,
  Save,
  CheckCircle2,
  Quote,
  HandHeart,
} from 'lucide-react'
import { toast } from 'sonner'

/* ------------------------- Data shapes ------------------------- */
interface DonationChild {
  id: string
  name: string
  photoColor: string
  grade: string
  status: string
  progressPercent: number
}
interface DonationWoman {
  id: string
  name: string
  photoColor: string
  goal: string
  status: string
  progressPercent: number
}
interface DonorDonation {
  id: string
  createdAt: string
  amountUSD: number
  amountBDT: number
  paymentMethod: string
  paymentStatus: string
  transactionId?: string | null
  donorMessage?: string | null
  anonymous: boolean
  child?: DonationChild | null
  woman?: DonationWoman | null
}
interface DonorUpdate {
  id: string
  childId?: string | null
  womanId?: string | null
  title: string
  content: string
  photoColor: string
  milestone: boolean
  createdAt: string
  child?: { name: string } | null
  woman?: { name: string } | null
}

/* ------------------------- Main view ------------------------- */
export function DonorView() {
  const donor = useAppStore((s) => s.donor)
  const authLoaded = useAppStore((s) => s.authLoaded)
  const authLoading = useAppStore((s) => s.authLoading)

  if (!authLoaded || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <LoadingBlock label="Loading your portal…" />
      </div>
    )
  }
  return donor ? <DonorDashboard donor={donor} /> : <DonorAuth />
}

/* ============================ AUTH ============================ */
function DonorAuth() {
  const refreshAuth = useAppStore((s) => s.refreshAuth)
  const go = useAppStore((s) => s.go)
  const [tab, setTab] = React.useState<'login' | 'register'>('login')

  // login state
  const [loginEmail, setLoginEmail] = React.useState('')
  const [loginPassword, setLoginPassword] = React.useState('')
  const [loginLoading, setLoginLoading] = React.useState(false)

  // register state
  const [regName, setRegName] = React.useState('')
  const [regEmail, setRegEmail] = React.useState('')
  const [regPassword, setRegPassword] = React.useState('')
  const [regPhone, setRegPhone] = React.useState('')
  const [regCountry, setRegCountry] = React.useState('')
  const [regCity, setRegCity] = React.useState('')
  const [regLoading, setRegLoading] = React.useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your email and password')
      return
    }
    setLoginLoading(true)
    try {
      await api<{ donor: SafeDonor }>('/api/auth/donor/login', {
        method: 'POST',
        json: { email: loginEmail, password: loginPassword },
      })
      await refreshAuth()
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sign in')
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword) {
      toast.error('Name, email and password are required')
      return
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setRegLoading(true)
    try {
      await api<{ donor: SafeDonor }>('/api/auth/donor/register', {
        method: 'POST',
        json: {
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone || undefined,
          country: regCountry || undefined,
          city: regCity || undefined,
        },
      })
      await refreshAuth()
      toast.success('Account created — welcome to the family!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create account')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* warm background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-amber-50 dark:from-primary/10 dark:via-background dark:to-background" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft lg:grid-cols-2">
          {/* Side panel — hopeful image + tagline */}
          <div className="relative hidden lg:block">
            <Image
              src="/woman-training.png"
              alt="A woman in vocational training, building a brighter future"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 0px, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-primary-foreground">
              <Quote className="h-8 w-8 opacity-70 mb-3" />
              <p className="text-xl font-semibold leading-snug">
                One donation. Two lives changed.
              </p>
              <p className="mt-2 text-sm text-primary-foreground/85 leading-relaxed">
                Your generosity sends a child to school for a year and gives a woman
                three months of caregiver training. Track every life you touch, right here.
              </p>
              <button
                onClick={() => go('beneficiaries')}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground hover:gap-3 transition-all"
              >
                Meet the lives you could change <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Auth card */}
          <div className="p-6 sm:p-10">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Heart className="h-3.5 w-3.5" /> Donor Portal
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome, friend of the cause
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to follow the children and women you sponsor, see progress updates,
                and manage your profile.
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Create account</TabsTrigger>
              </TabsList>

              {/* Sign in */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-2">
                  <Field label="Email" icon={Mail}>
                    <Input
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </Field>
                  <Field label="Password" icon={Lock}>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </Field>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-2">
                  <Field label="Full name" icon={UserIcon}>
                    <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your name" required />
                  </Field>
                  <Field label="Email" icon={Mail}>
                    <Input type="email" autoComplete="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" required />
                  </Field>
                  <Field label="Password (6+ characters)" icon={Lock}>
                    <Input type="password" autoComplete="new-password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" required />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone (optional)" icon={Phone}>
                      <Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+880 ..." />
                    </Field>
                    <Field label="City (optional)" icon={MapPin}>
                      <Input value={regCity} onChange={(e) => setRegCity(e.target.value)} placeholder="Dhaka" />
                    </Field>
                  </div>
                  <Field label="Country (optional)" icon={Globe}>
                    <Input value={regCountry} onChange={(e) => setRegCountry(e.target.value)} placeholder="Bangladesh" />
                  </Field>
                  <Button type="submit" className="w-full" disabled={regLoading}>
                    {regLoading ? 'Creating account…' : 'Create account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">Demo donor:</span>{' '}
              donor@odctl.org / donor123
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
      </Label>
      {children}
    </div>
  )
}

/* ============================ DASHBOARD ============================ */
function DonorDashboard({ donor }: { donor: SafeDonor }) {
  const refreshAuth = useAppStore((s) => s.refreshAuth)
  const go = useAppStore((s) => s.go)
  const [signingOut, setSigningOut] = React.useState(false)
  const [tab, setTab] = React.useState<'sponsorship' | 'updates' | 'profile'>('sponsorship')

  const [donations, setDonations] = React.useState<DonorDonation[]>([])
  const [updates, setUpdates] = React.useState<DonorUpdate[]>([])
  const [loadingDonations, setLoadingDonations] = React.useState(true)
  const [loadingUpdates, setLoadingUpdates] = React.useState(true)

  const loadDonations = React.useCallback(async () => {
    setLoadingDonations(true)
    try {
      const data = await api<DonorDonation[]>('/api/donor/donations')
      setDonations(Array.isArray(data) ? data : [])
    } catch {
      setDonations([])
    } finally {
      setLoadingDonations(false)
    }
  }, [])

  const loadUpdates = React.useCallback(async () => {
    setLoadingUpdates(true)
    try {
      const data = await api<DonorUpdate[]>('/api/donor/updates')
      setUpdates(Array.isArray(data) ? data : [])
    } catch {
      setUpdates([])
    } finally {
      setLoadingUpdates(false)
    }
  }, [])

  React.useEffect(() => {
    loadDonations()
    loadUpdates()
  }, [loadDonations, loadUpdates])

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

  // impact totals
  const completed = donations.filter((d) => d.paymentStatus === 'COMPLETED')
  const childrenSupported = new Set(completed.map((d) => d.child?.id).filter(Boolean)).size
  const womenSupported = new Set(completed.map((d) => d.woman?.id).filter(Boolean)).size
  const totalUSD = completed.reduce((s, d) => s + (d.amountUSD || 0), 0)

  const firstName = donor.name.split(' ')[0]

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      {/* Top greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
      >
        <div className="flex items-center gap-4">
          <ColorAvatar name={donor.name} color={donor.avatarColor} size={56} />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-2xl font-bold tracking-tight">{firstName}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Joined {formatDate(donor.createdAt)}
              {donor.city ? ` · ${donor.city}` : ''}
              {donor.country ? `, ${donor.country}` : ''}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </motion.div>

      {/* Impact summary */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          value={childrenSupported}
          label="Children sponsored"
          icon={GraduationCap}
          accent="#0d9488"
        />
        <StatCard
          value={womenSupported}
          label="Women trained"
          icon={Users}
          accent="#ec4899"
        />
        <StatCard
          value={formatUSD(totalUSD)}
          label="Total donated"
          icon={DollarSign}
          accent="#f59e0b"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-10">
        <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-3">
          <TabsTrigger value="sponsorship">Your sponsored lives</TabsTrigger>
          <TabsTrigger value="updates">Progress updates</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="sponsorship" className="mt-6">
          {loadingDonations ? (
            <LoadingBlock label="Loading your sponsorships…" />
          ) : donations.length === 0 ? (
            <EmptyState
              icon={HandHeart}
              title="No sponsorships yet"
              description="When you make a donation, the children and women you sponsor will appear here with live progress updates."
              action={
                <Button onClick={() => go('beneficiaries')}>
                  <Heart className="h-4 w-4" /> Browse beneficiaries
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5">
              <AnimatePresence mode="popLayout">
                {donations.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                  >
                    <SponsorshipCard donation={d} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="mt-6">
          {loadingUpdates ? (
            <LoadingBlock label="Loading progress updates…" />
          ) : updates.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No updates yet"
              description="Progress updates from your sponsored beneficiaries will appear here as they're posted."
            />
          ) : (
            <UpdatesTimeline updates={updates} />
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileEditor donor={donor} onUpdated={refreshAuth} />
        </TabsContent>
      </Tabs>
    </section>
  )
}

/* ------------------------- Sponsorship card ------------------------- */
function SponsorshipCard({ donation }: { donation: DonorDonation }) {
  const openBeneficiary = useAppStore((s) => s.openBeneficiary)
  const [expanded, setExpanded] = React.useState(false)

  const hasChild = !!donation.child
  const hasWoman = !!donation.woman

  return (
    <Card className="overflow-hidden py-0">
      {/* donation meta strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-5 py-3 text-xs">
        <span className="font-semibold text-foreground">{formatUSD(donation.amountUSD)}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{formatBDT(donation.amountBDT)}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{donation.paymentMethod}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{formatDate(donation.createdAt)}</span>
        <span className="ml-auto">
          <StatusBadge status={donation.paymentStatus} />
        </span>
      </div>

      <CardContent className="p-5 grid gap-5 sm:grid-cols-2">
        {/* Child */}
        {hasChild && donation.child ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <ColorAvatar name={donation.child.name} color={donation.child.photoColor} size={44} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{donation.child.name}</p>
                  <StatusBadge status={donation.child.status} />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> {donation.child.grade}
                </p>
              </div>
            </div>
            <ProgressBlock value={donation.child.progressPercent} label="Education progress" />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => openBeneficiary('CHILD', donation.child!.id)}
            >
              View full profile
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            No child linked to this donation
          </div>
        )}

        {/* Woman */}
        {hasWoman && donation.woman ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <ColorAvatar name={donation.woman.name} color={donation.woman.photoColor} size={44} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{donation.woman.name}</p>
                  <StatusBadge status={donation.woman.status} />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {donation.woman.goal}
                </p>
              </div>
            </div>
            <ProgressBlock value={donation.woman.progressPercent} label="Training progress" />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => openBeneficiary('WOMAN', donation.woman!.id)}
            >
              View full profile
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            No woman linked to this donation
          </div>
        )}
      </CardContent>

      {/* donor message + transaction id */}
      {(donation.donorMessage || donation.transactionId) && (
        <div className="border-t border-border px-5 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span>Donation details</span>
            <span>{expanded ? 'Hide' : 'Show'}</span>
          </button>
          {expanded && (
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              {donation.donorMessage && (
                <p className="italic">“{donation.donorMessage}”</p>
              )}
              {donation.transactionId && (
                <p>Transaction ID: <span className="font-mono text-foreground">{donation.transactionId}</span></p>
              )}
              <p>Anonymous gift: {donation.anonymous ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/* ------------------------- Updates timeline ------------------------- */
function UpdatesTimeline({ updates }: { updates: DonorUpdate[] }) {
  const openBeneficiary = useAppStore((s) => s.openBeneficiary)
  const sorted = [...updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-5">
        {sorted.map((u, i) => {
          const name = u.child?.name || u.woman?.name || 'Your beneficiary'
          const type = u.childId ? 'CHILD' : 'WOMAN'
          const id = u.childId || u.womanId || ''
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="relative"
            >
              <div
                className="absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-2 ring-background"
                style={{ background: u.milestone ? '#0d9488' : u.photoColor }}
              />
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  {u.milestone ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="font-semibold text-sm">{u.title}</span>
                  {u.milestone && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Milestone
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{timeAgo(u.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{u.content}</p>
                <button
                  onClick={() => openBeneficiary(type, id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  About {name} <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------- Profile editor ------------------------- */
function ProfileEditor({ donor, onUpdated }: { donor: SafeDonor; onUpdated: () => Promise<void> }) {
  const [name, setName] = React.useState(donor.name)
  const [phone, setPhone] = React.useState(donor.phone ?? '')
  const [country, setCountry] = React.useState(donor.country ?? '')
  const [city, setCity] = React.useState(donor.city ?? '')
  const [bio, setBio] = React.useState(donor.bio ?? '')
  const [savingProfile, setSavingProfile] = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [savingPassword, setSavingPassword] = React.useState(false)

  // Sync if donor changes after refresh
  React.useEffect(() => {
    setName(donor.name)
    setPhone(donor.phone ?? '')
    setCountry(donor.country ?? '')
    setCity(donor.city ?? '')
    setBio(donor.bio ?? '')
  }, [donor])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api('/api/donor/me', {
        method: 'PUT',
        json: { name, phone: phone || null, country: country || null, city: city || null, bio: bio || null },
      })
      await onUpdated()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      await api('/api/donor/password', {
        method: 'PUT',
        json: { currentPassword, newPassword },
      })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Password changed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" /> Profile details
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone" icon={Phone}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 ..." />
              </Field>
              <Field label="City" icon={MapPin}>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
            </div>
            <Field label="Country" icon={Globe}>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
            <Field label="Bio">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A few words about why you support this cause…"
                rows={3}
              />
            </Field>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={savingProfile}>
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving…' : 'Save changes'}
              </Button>
              <div className="flex items-center gap-2">
                <ColorAvatar name={donor.name} color={donor.avatarColor} size={32} />
                <span className="text-xs text-muted-foreground">Avatar color: <span className="font-mono">{donor.avatarColor}</span></span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Change password
          </CardTitle>
          <CardDescription>Choose a strong, unique password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-4">
            <Field label="Current password" icon={Lock}>
              <Input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="New password (6+ characters)" icon={Lock}>
              <Input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              <KeyRound className="h-4 w-4" />
              {savingPassword ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}