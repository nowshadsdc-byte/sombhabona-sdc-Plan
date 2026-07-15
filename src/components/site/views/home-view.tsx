'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { api, formatUSD } from '@/lib/api'
import {
  ColorAvatar,
  SectionHeading,
  StatusBadge,
  StatCard,
  LoadingBlock,
} from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Heart,
  Users,
  HandHeart,
  TrendingUp,
  ArrowRight,
  Search,
  HandCoins,
  LineChart,
  Sparkles,
  ShieldCheck,
  Globe2,
  Lock,
  GraduationCap,
  Stethoscope,
  Handshake,
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
interface Package {
  id: string
  name: string
  description: string
  priceUSD: number
  priceBDT: number
  childBenefit: string
  womanBenefit: string
  imageColor: string
  active: boolean
}
interface Stats {
  childrenCount: number
  womenCount: number
  donorsCount: number
  donationsCount: number
  childrenSupported: number
  womenSupported: number
  totalRaisedUSD: number
}

/* animation variants */
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

export function HomeView() {
  const go = useAppStore((s) => s.go)
  const content = useAppStore((s) => s.content)
  const openBeneficiary = useAppStore((s) => s.openBeneficiary)

  const [stats, setStats] = React.useState<Stats | null>(null)
  const [pkg, setPkg] = React.useState<Package | null>(null)
  const [children, setChildren] = React.useState<Child[]>([])
  const [women, setWomen] = React.useState<Woman[]>([])

  React.useEffect(() => {
    api<Stats>('/api/stats')
      .then(setStats)
      .catch(() => toast.error('Could not load live stats'))
    api<Package[]>('/api/packages')
      .then((p) => setPkg(p.find((x) => x.active) ?? p[0] ?? null))
      .catch(() => toast.error('Could not load the donation package'))
    api<Child[]>('/api/children?status=AVAILABLE')
      .then((c) => setChildren(c.slice(0, 3)))
      .catch(() => setChildren([]))
    api<Woman[]>('/api/women?status=AVAILABLE')
      .then((w) => setWomen(w.slice(0, 3)))
      .catch(() => setWomen([]))
  }, [])

  const heroBadge = content.heroBadge ?? 'A Joint Initiative of Sombhabona × Skills Development Centre (SDC)'
  const heroTitle = content.heroTitle ?? 'One Donation. Two Lives Changed. A Future Filled with Hope.'
  const heroSubtitle =
    content.heroSubtitle ??
    'With a single donation of USD 250, you give one child a full year of quality education AND one woman a 3-month caregiver training program — building sustainable, measurable, lasting impact.'
  const heroCta = content.heroCta ?? 'Sponsor Two Lives Now'

  return (
    <div className="space-y-0">
      {/* ===== 1. Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-main.png"
            alt="Children and women studying and training together"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* teal gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              {heroBadge}
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 text-balance sm:text-lg">
              {heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="text-base" onClick={() => go('donate')}>
                <Heart className="h-5 w-5" /> {heroCta}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                onClick={() => go('beneficiaries')}
              >
                Meet the Beneficiaries <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* floating stat chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-white backdrop-blur-md ring-1 ring-white/20"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>1,650+ students</span>
              <span className="opacity-40">·</span>
              <span>32,000+ beneficiaries since 2011</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. Live impact stats bar ===== */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {!stats ? (
            <LoadingBlock label="Loading live impact numbers…" />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                value={stats.childrenCount}
                label="Children waiting"
                icon={Heart}
                accent="#0d9488"
              />
              <StatCard
                value={stats.womenCount}
                label="Women in training"
                icon={Users}
                accent="#ec4899"
              />
              <StatCard
                value={stats.donorsCount}
                label="Supporters"
                icon={HandHeart}
                accent="#f59e0b"
              />
              <StatCard
                value={formatUSD(stats.totalRaisedUSD)}
                label="Total raised"
                icon={TrendingUp}
                accent="#14b8a6"
              />
            </div>
          )}
        </div>
      </section>

      {/* ===== 3. The Two Organizations ===== */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Two Trusted Organizations"
              title="One shared mission: lasting, measurable impact"
              subtitle="Sombhabona and SDC have joined forces to make every donation count twice — turning a single gift into two transformed lives."
            />
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <motion.div {...fadeUp}>
              <OrgCard
                logo="/sombhabona_logo.webp"
                logoAlt="Sombhabona"
                title={content.aboutOrg1Title ?? 'Sombhabona'}
                body={
                  content.aboutOrg1Body ??
                  'Since 2011, Sombhabona empowers lives with free education, skill development, relief aid, and ICT training — impacting 1,650+ students and 32,000+ beneficiaries nationwide.'
                }
                accent="#0d9488"
              />
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <OrgCard
                logo="/sdc-logo.png"
                logoAlt="Skills Development Centre"
                title={content.aboutOrg2Title ?? 'Skills Development Centre (SDC)'}
                body={
                  content.aboutOrg2Body ??
                  'SDC is a premier training platform delivering accessible, high-quality, industry-aligned education across Bangladesh and beyond — through both online and offline channels.'
                }
                accent="#f59e0b"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 4. The Joint Initiative ===== */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div {...fadeUp} className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
                <Image
                  src="/joint-initiative.png"
                  alt="Hands joining together — Sombhabona and SDC joint initiative"
                  fill
                  sizes="(min-width:1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Handshake className="h-3.5 w-3.5" /> Joint Initiative
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {content.jointTitle ?? 'One Donation, Change Two Lives'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {content.jointBody ??
                  'These two organizations have come together to launch a meaningful social impact initiative. The project is fully managed and implemented by Sombhabona, ensuring every donation is used effectively to create measurable and lasting impact.'}
              </p>

              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">USD 250</span>
                  <span className="text-sm text-muted-foreground">≈ BDT 30,000</span>
                </div>
                <div className="mt-2 text-sm font-medium text-foreground">
                  One donation →{' '}
                  <span className="text-primary">2 lives changed</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>1 child · 1 full year of education</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>1 woman · 3-month caregiver training</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button size="lg" onClick={() => go('donate')}>
                  <Heart className="h-5 w-5" /> Sponsor Two Lives Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 5. How it works ===== */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="How it works"
              title="From browsing to changing a life in 4 steps"
              subtitle="Transparent, donor-driven sponsorship. You choose exactly who you support — and then track their journey in your own portal."
            />
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Search,
                title: 'Browse children & women',
                body: 'Explore detailed profiles of children waiting for school and women seeking livelihood training.',
              },
              {
                icon: HandHeart,
                title: 'Choose who to support',
                body: 'Select the child and the woman whose story moves you. The sponsorship is yours to define.',
              },
              {
                icon: HandCoins,
                title: 'Donate USD 250',
                body: 'Pay securely online (card / bKash) or offline via bank transfer — whichever suits you.',
              },
              {
                icon: LineChart,
                title: 'Track progress',
                body: 'Log in to your donor portal to see updates, milestones, and success stories as they unfold.',
              },
            ].map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span className="text-3xl font-bold text-muted-foreground/30">0{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{s.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. The Package ===== */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="The Package"
              title="One donation. Two transformations."
              subtitle="Every USD 250 gift funds a complete year of education for a child and a 3-month caregiver training program for a woman — together, they break two cycles of poverty."
            />
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* visual side */}
            <motion.div {...fadeUp} className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-soft">
                <Image src="/child-edu.png" alt="A young girl writing in her notebook at school" fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-xs font-semibold text-white">Child's education</div>
                </div>
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-soft">
                <Image src="/woman-training.png" alt="A woman wearing a stethoscope during caregiver training" fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-xs font-semibold text-white">Woman's training</div>
                </div>
              </div>
            </motion.div>

            {/* content side */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="h-full border-primary/20">
                <CardContent className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {pkg?.name ?? 'One Donation, Two Lives'}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {pkg?.description ??
                          'A single donation that transforms two lives: one year of quality education for a child, and a 3-month caregiver training program for a woman.'}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-primary px-3 py-2 text-center text-primary-foreground">
                      <div className="text-xl font-bold leading-none">USD {pkg?.priceUSD ?? 250}</div>
                      <div className="text-[10px] uppercase tracking-wide opacity-80">≈ BDT {(pkg?.priceBDT ?? 30000).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <BenefitTile
                      icon={GraduationCap}
                      tone="teal"
                      title="For the child"
                      body={pkg?.childBenefit ?? 'One full year of quality education — books, uniform, tuition, and mentorship.'}
                    />
                    <BenefitTile
                      icon={Stethoscope}
                      tone="rose"
                      title="For the woman"
                      body={pkg?.womanBenefit ?? '3-month professional Caregiver Training Program — equipping her for sustainable employment.'}
                    />
                  </div>

                  <div className="mt-auto pt-2">
                    <Button size="lg" className="w-full" onClick={() => go('donate')}>
                      <Heart className="h-4 w-4" /> Donate USD {pkg?.priceUSD ?? 250} & Change Two Lives
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 7. Complete Transparency ===== */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Complete Transparency"
              title={content.transparencyTitle ?? 'Complete Transparency'}
              subtitle={content.transparencyBody ?? 'Transparency is at the heart of this initiative. Every donor can see exactly how their contribution makes a difference.'}
            />
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Public beneficiary lists', body: 'Every child and woman we support is publicly listed with their story and progress.' },
              { icon: HandHeart, title: 'Donor-selectable', body: 'You choose the exact lives you want to sponsor — no anonymous pooled giving.' },
              { icon: Lock, title: 'Secure donor account', body: 'A personal portal keeps your donations, receipts, and updates in one safe place.' },
              { icon: LineChart, title: 'Progress updates', body: 'Receive milestone updates and success stories from the people you sponsor.' },
              { icon: Globe2, title: 'Public donor community', body: 'Opt in to be publicly thanked and join a community of supporters worldwide.' },
              { icon: ShieldCheck, title: 'Admin accountability', body: 'All changes to beneficiaries and content are tracked through an admin audit log.' },
            ].map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                <div className="flex h-full gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. Beneficiaries preview ===== */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fadeUp}>
            <SectionHeading
              eyebrow="Real lives, real names"
              title="Meet a few of the people you can support"
              subtitle="These are not stock photos. For dignity and privacy we show initials in each person's chosen color — but the stories, dreams, and progress are real."
            />
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.length === 0 && women.length === 0 ? (
              <div className="col-span-full">
                <LoadingBlock label="Loading beneficiaries…" />
              </div>
            ) : (
              <>
                {children.map((c, i) => (
                  <motion.div key={c.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }}>
                    <PreviewCard
                      name={c.name}
                      color={c.photoColor}
                      meta={`${c.age} yrs · ${c.location} · ${c.grade}`}
                      kind="Child"
                      status={c.status}
                      dream={c.dream}
                      onClick={() => openBeneficiary('CHILD', c.id)}
                    />
                  </motion.div>
                ))}
                {women.map((w, i) => (
                  <motion.div key={w.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i + 3) * 0.05 }}>
                    <PreviewCard
                      name={w.name}
                      color={w.photoColor}
                      meta={`${w.age} yrs · ${w.location} · Caregiver training`}
                      kind="Woman"
                      status={w.status}
                      dream={w.goal}
                      onClick={() => openBeneficiary('WOMAN', w.id)}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {children.length > 0 || women.length > 0 ? (
            <div className="mt-10 text-center">
              <Button size="lg" variant="outline" onClick={() => go('beneficiaries')}>
                View all beneficiaries <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* ===== 9. Final CTA band ===== */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-0 opacity-20">
          <Image src="/impact-community.png" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />

        <motion.div
          {...fadeUp}
          className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center"
        >
          <Sparkles className="mx-auto h-10 w-10 text-amber-300" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            One Donation. Two Lives Changed. A Future Filled with Hope.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 text-balance sm:text-lg">
            Become a sponsor today. Your USD 250 will put a child through a full year of school and give a woman a livelihood for life.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => go('donate')}
            >
              <Heart className="h-5 w-5" /> Sponsor Two Lives Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => go('beneficiaries')}
            >
              Browse beneficiaries
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

/* ---------- private helper components ---------- */

function OrgCard({
  logo,
  logoAlt,
  title,
  body,
  accent,
}: {
  logo: string
  logoAlt: string
  title: string
  body: string
  accent: string
}) {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-1 ring-border"
            style={{ background: `${accent}14` }}
          >
            <Image src={logo} alt={logoAlt} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}

function BenefitTile({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  tone: 'teal' | 'rose'
}) {
  const toneCls = tone === 'teal' ? 'bg-primary/10 text-primary' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

function PreviewCard({
  name,
  color,
  meta,
  kind,
  status,
  dream,
  onClick,
}: {
  name: string
  color: string
  meta: string
  kind: string
  status: string
  dream: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
    >
      <ColorAvatar name={name} color={color} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{name}</span>
          <StatusBadge status={status} className="hidden sm:inline-flex" />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{meta}</div>
        <div className="mt-0.5 truncate text-xs font-medium text-primary">{kind} · {dream}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </button>
  )
}
