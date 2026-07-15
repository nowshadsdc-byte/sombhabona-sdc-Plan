'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { api, formatDate } from '@/lib/api'
import {
  ColorAvatar,
  SectionHeading,
  EmptyState,
  LoadingBlock,
  StatCard,
} from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Sparkles,
  Heart,
  MapPin,
  Calendar,
  HandHeart,
  Users,
  DollarSign,
  TrendingUp,
  Award,
} from 'lucide-react'

interface PublicDonor {
  id: string
  name: string
  avatarColor: string
  city?: string | null
  country?: string | null
  bio?: string | null
  createdAt: string
  donationsCount: number
}

interface PublicStats {
  childrenCount: number
  womenCount: number
  donorsCount: number
  donationsCount: number
  childrenSupported: number
  womenSupported: number
  totalRaisedUSD: number
}

export function DonorsView() {
  const go = useAppStore((s) => s.go)
  const currentDonor = useAppStore((s) => s.donor)

  const [donors, setDonors] = React.useState<PublicDonor[]>([])
  const [stats, setStats] = React.useState<PublicStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState('')
  const [sort, setSort] = React.useState<'recent' | 'donations'>('recent')

  React.useEffect(() => {
    let alive = true
    Promise.all([
      api<PublicDonor[]>('/api/donors').catch(() => [] as PublicDonor[]),
      api<PublicStats>('/api/stats').catch(() => null),
    ]).then(([d, s]) => {
      if (!alive) return
      setDonors(Array.isArray(d) ? d : [])
      setStats(s)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = donors
    if (q) {
      list = list.filter((d) =>
        [d.name, d.city, d.country].filter(Boolean).some((v) => (v as string).toLowerCase().includes(q)),
      )
    }
    list = [...list].sort((a, b) => {
      if (sort === 'donations') return b.donationsCount - a.donationsCount
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [donors, query, sort])

  return (
    <section className="relative">
      {/* hero backdrop */}
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/10 to-background" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <SectionHeading
          eyebrow="Our Community"
          title="The people making it possible"
          subtitle="Every donor here is publicly listed by choice — celebrating openness, accountability, and the shared belief that one donation can change two lives. Join them."
        />

        {/* Stats strip */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            value={stats?.donorsCount ?? '—'}
            label="Supporters"
            icon={Users}
            accent="#0d9488"
          />
          <StatCard
            value={stats ? `$${Math.round(stats.totalRaisedUSD).toLocaleString()}` : '—'}
            label="Raised (USD)"
            icon={DollarSign}
            accent="#f59e0b"
          />
          <StatCard
            value={stats?.childrenSupported ?? '—'}
            label="Children sponsored"
            icon={HandHeart}
            accent="#14b8a6"
          />
          <StatCard
            value={stats?.womenSupported ?? '—'}
            label="Women trained"
            icon={Award}
            accent="#ec4899"
          />
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city, or country…"
              className="pl-9"
              aria-label="Search donors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort by</span>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-[180px]" aria-label="Sort donors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> Most recent
                  </span>
                </SelectItem>
                <SelectItem value="donations">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" /> Most donations
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <LoadingBlock label="Loading our community…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title={query ? 'No donors found' : 'No public donors yet'}
              description={
                query
                  ? `No supporters match "${query}". Try a different name or city.`
                  : 'Be the first supporter to appear on this wall.'
              }
              action={
                !query ? (
                  <Button onClick={() => go('donate')}>
                    <Heart className="h-4 w-4" /> Donate now
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d, i) => {
                const isYou = currentDonor?.id === d.id
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <DonorCard donor={d} isYou={isYou} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {!loading && filtered.length > 0 && (
          <div className="mt-14">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-teal-700 px-6 py-10 sm:px-12 sm:py-14 text-center text-primary-foreground shadow-soft">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="relative">
                <Sparkles className="mx-auto h-8 w-8 opacity-80" />
                <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Become a supporter
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85 leading-relaxed">
                  A single donation of USD 250 sponsors a child's education for a year
                  and trains a woman as a caregiver. Your name could be on this wall.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="mt-6"
                  onClick={() => go('donate')}
                >
                  <Heart className="h-4 w-4" /> Donate now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function DonorCard({ donor, isYou }: { donor: PublicDonor; isYou: boolean }) {
  return (
    <Card
      className={
        isYou
          ? 'h-full py-0 ring-2 ring-primary shadow-glow'
          : 'h-full py-0 hover:shadow-soft hover:border-primary/40 transition-all'
      }
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <ColorAvatar name={donor.name} color={donor.avatarColor} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{donor.name}</h3>
              {isYou && (
                <Badge className="bg-primary text-primary-foreground">You</Badge>
              )}
            </div>
            {(donor.city || donor.country) && (
              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[donor.city, donor.country].filter(Boolean).join(', ')}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {formatDate(donor.createdAt)}
            </p>
          </div>
        </div>

        {donor.bio && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            “{donor.bio}”
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Heart className="h-3 w-3" />
            {donor.donationsCount} {donor.donationsCount === 1 ? 'donation' : 'donations'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
