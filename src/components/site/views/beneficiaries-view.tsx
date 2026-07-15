'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { api } from '@/lib/api'
import {
  ColorAvatar,
  SectionHeading,
  StatusBadge,
  ProgressBlock,
  EmptyState,
} from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Search,
  Users,
  Heart,
  MapPin,
  GraduationCap,
  Target,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

/* ---------- shared data types ---------- */
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

type TabValue = 'children' | 'women'
type StatusFilter = 'ALL' | 'AVAILABLE' | 'SUPPORTED' | 'DONE'

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

export function BeneficiariesView() {
  const openBeneficiary = useAppStore((s) => s.openBeneficiary)

  const [tab, setTab] = React.useState<TabValue>('children')
  const [children, setChildren] = React.useState<Child[]>([])
  const [women, setWoman] = React.useState<Woman[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<StatusFilter>('ALL')

  // fetch children on mount
  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    api<Child[]>('/api/children')
      .then((d) => {
        if (!cancelled) setChildren(d)
      })
      .catch(() => toast.error('Could not load children'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // fetch women on mount (so tab switch is instant)
  React.useEffect(() => {
    let cancelled = false
    api<Woman[]>('/api/women')
      .then((d) => {
        if (!cancelled) setWoman(d)
      })
      .catch(() => toast.error('Could not load women'))
    return () => {
      cancelled = true
    }
  }, [])

  const filteredChildren = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return children.filter((c) => {
      if (status !== 'ALL' && !matchStatus(status, c.status)) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.grade.toLowerCase().includes(q) ||
        c.dream.toLowerCase().includes(q)
      )
    })
  }, [children, query, status])

  const filteredWomen = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return women.filter((w) => {
      if (status !== 'ALL' && !matchStatus(status, w.status)) return false
      if (!q) return true
      return (
        w.name.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        w.goal.toLowerCase().includes(q) ||
        w.familyInfo.toLowerCase().includes(q)
      )
    })
  }, [women, query, status])

  const availableChildren = children.filter((c) => c.status === 'AVAILABLE').length
  const availableWomen = women.filter((w) => w.status === 'AVAILABLE').length

  return (
    <div className="bg-background">
      {/* header */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <SectionHeading
            eyebrow="Beneficiaries"
            title="Meet the lives you can change"
            subtitle="Every name here is real. Browse, search, and choose exactly who you want to sponsor — then follow their journey in your donor portal."
          />

          {/* quick counts */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-medium ring-1 ring-border">
              <Heart className="h-4 w-4 text-rose-500" />
              {availableChildren} {availableChildren === 1 ? 'child' : 'children'} waiting for support
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-medium ring-1 ring-border">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {availableWomen} {availableWomen === 1 ? 'woman' : 'women'} waiting for training
            </span>
          </div>
        </div>
      </section>

      {/* controls */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
              <TabsList>
                <TabsTrigger value="children" className="gap-1.5">
                  <Heart className="h-4 w-4" /> Children
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                    {children.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="women" className="gap-1.5">
                  <Sparkles className="h-4 w-4" /> Women
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                    {women.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === 'children' ? 'Search by name, grade, location…' : 'Search by name, goal, location…'}
                  className="h-9 w-full pl-8 sm:w-72"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter" className="sr-only">
                  Status
                </Label>
                <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                  <SelectTrigger id="status-filter" className="h-9 w-[180px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="SUPPORTED">Supported</SelectItem>
                    <SelectItem value="DONE">Graduated / Employed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        {tab === 'children' ? (
          <ChildrenGrid
            list={filteredChildren}
            loading={loading}
            onOpen={(id) => openBeneficiary('CHILD', id)}
            hasQuery={!!query || status !== 'ALL'}
          />
        ) : (
          <WomenGrid
            list={filteredWomen}
            onOpen={(id) => openBeneficiary('WOMAN', id)}
            hasQuery={!!query || status !== 'ALL'}
          />
        )}
      </section>
    </div>
  )
}

/* ---------- helpers ---------- */
function matchStatus(filter: StatusFilter, status: string): boolean {
  if (filter === 'AVAILABLE') return status === 'AVAILABLE'
  if (filter === 'SUPPORTED') return status === 'SUPPORTED'
  if (filter === 'DONE') return status === 'GRADUATED' || status === 'EMPLOYED'
  return false
}

/* ---------- children grid ---------- */
function ChildrenGrid({
  list,
  loading,
  onOpen,
  hasQuery,
}: {
  list: Child[]
  loading: boolean
  onOpen: (id: string) => void
  hasQuery: boolean
}) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-24 animate-pulse bg-accent" />
            <CardContent className="space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-accent" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-accent" />
              <div className="h-2 w-full animate-pulse rounded bg-accent" />
              <div className="h-9 w-full animate-pulse rounded bg-accent" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (list.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={hasQuery ? 'No children match your filters' : 'No children right now'}
        description={
          hasQuery
            ? 'Try adjusting your search or status filter.'
            : 'Please check back soon — new children are added regularly.'
        }
      />
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
        >
          <BeneficiaryCard
            type="CHILD"
            id={c.id}
            name={c.name}
            color={c.photoColor}
            status={c.status}
            progressPercent={c.progressPercent}
            primaryMeta={`${c.age} yrs · ${c.location}`}
            secondaryMeta={`Grade ${c.grade} · ${c.school}`}
            snippet={c.background}
            onOpen={onOpen}
          />
        </motion.div>
      ))}
    </div>
  )
}

/* ---------- women grid ---------- */
function WomenGrid({
  list,
  onOpen,
  hasQuery,
}: {
  list: Woman[]
  onOpen: (id: string) => void
  hasQuery: boolean
}) {
  if (list.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={hasQuery ? 'No women match your filters' : 'No women right now'}
        description={
          hasQuery
            ? 'Try adjusting your search or status filter.'
            : 'Please check back soon — new women enrollees are added regularly.'
        }
      />
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((w, i) => (
        <motion.div
          key={w.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
        >
          <BeneficiaryCard
            type="WOMAN"
            id={w.id}
            name={w.name}
            color={w.photoColor}
            status={w.status}
            progressPercent={w.progressPercent}
            primaryMeta={`${w.age} yrs · ${w.location}`}
            secondaryMeta={`Family: ${w.familyInfo}`}
            snippet={w.background}
            onOpen={onOpen}
          />
        </motion.div>
      ))}
    </div>
  )
}

/* ---------- card ---------- */
function BeneficiaryCard({
  type,
  id,
  name,
  color,
  status,
  progressPercent,
  primaryMeta,
  secondaryMeta,
  snippet,
  onOpen,
}: {
  type: 'CHILD' | 'WOMAN'
  id: string
  name: string
  color: string
  status: string
  progressPercent: number
  primaryMeta: string
  secondaryMeta: string
  snippet: string
  onOpen: (id: string) => void
}) {
  const available = status === 'AVAILABLE'
  const Icon = type === 'CHILD' ? GraduationCap : Target
  return (
    <Card
      className={`group h-full overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-glow ${
        available ? 'ring-2 ring-primary/40' : 'ring-1 ring-transparent'
      }`}
    >
      {/* colored banner */}
      <div
        className="relative flex h-24 items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
      >
        <div className="absolute inset-0 bg-grid opacity-20" />
        <ColorAvatar
          name={name}
          color={color}
          size={64}
          className="ring-4 ring-background/90"
        />
        {available && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Ready to sponsor
          </span>
        )}
      </div>

      <CardContent className="flex h-[calc(100%-6rem)] flex-col gap-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight">{name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {primaryMeta}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="line-clamp-1">{secondaryMeta}</span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{snippet}</p>

        <div className="mt-auto">
          <ProgressBlock
            value={progressPercent}
            label={type === 'CHILD' ? 'Education progress' : 'Training progress'}
          />
        </div>

        <Button
          size="sm"
          variant={available ? 'default' : 'outline'}
          className="mt-1 w-full"
          onClick={() => onOpen(id)}
        >
          {available ? (
            <>
              <Heart className="h-4 w-4" /> View profile & sponsor
            </>
          ) : (
            <>
              View profile <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
