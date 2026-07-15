'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/app-store'
import { api, formatUSD, formatBDT } from '@/lib/api'
import {
  ColorAvatar,
  LoadingBlock,
} from '@/components/site/primitives'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Target,
  CreditCard,
  Building2,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Lock,
  HandHeart,
  PartyPopper,
} from 'lucide-react'

/* ---------- data types ---------- */
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

interface DonationResponse {
  donation: {
    id: string
    amountUSD: number
    amountBDT: number
    paymentMethod: string
    paymentStatus: string
    createdAt: string
  }
  donor?: { id: string; name: string; email: string }
}

type Step = 1 | 2 | 3 | 'success'
type PaymentMethod = 'ONLINE' | 'OFFLINE'

export function DonateView() {
  const go = useAppStore((s) => s.go)
  const donor = useAppStore((s) => s.donor)
  const refreshAuth = useAppStore((s) => s.refreshAuth)
  const donateSelection = useAppStore((s) => s.donateSelection)
  const setDonateSelection = useAppStore((s) => s.setDonateSelection)

  const [children, setChildren] = React.useState<Child[]>([])
  const [women, setWomen] = React.useState<Woman[]>([])
  const [pkg, setPkg] = React.useState<Package | null>(null)
  const [loading, setLoading] = React.useState(true)

  const [step, setStep] = React.useState<Step>(1)
  const [selectedChildId, setSelectedChildId] = React.useState<string | undefined>(donateSelection.childId)
  const [selectedWomanId, setSelectedWomanId] = React.useState<string | undefined>(donateSelection.womanId)

  // donor form state
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [city, setCity] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [anonymous, setAnonymous] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('ONLINE')
  const [transactionId, setTransactionId] = React.useState('')

  const [submitting, setSubmitting] = React.useState(false)
  const [successData, setSuccessData] = React.useState<DonationResponse | null>(null)

  // fetch data on mount
  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api<Child[]>('/api/children?status=AVAILABLE').catch(() => [] as Child[]),
      api<Woman[]>('/api/women?status=AVAILABLE').catch(() => [] as Woman[]),
      api<Package[]>('/api/packages')
        .then((p) => p.find((x) => x.active) ?? p[0] ?? null)
        .catch(() => null),
    ])
      .then(([c, w, p]) => {
        if (cancelled) return
        setChildren(c)
        setWomen(w)
        setPkg(p)
        // pre-select first child/woman if user came from "Sponsor" with a single selection
        if (donateSelection.childId && c.some((x) => x.id === donateSelection.childId)) {
          setSelectedChildId(donateSelection.childId)
        }
        if (donateSelection.womanId && w.some((x) => x.id === donateSelection.womanId)) {
          setSelectedWomanId(donateSelection.womanId)
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? null
  const selectedWoman = women.find((w) => w.id === selectedWomanId) ?? null

  function canAdvanceStep1() {
    return !!selectedChildId
  }
  function canAdvanceStep2() {
    return !!selectedWomanId
  }

  // validate step 3 form
  function validateStep3(): string | null {
    if (!donor) {
      if (!name.trim()) return 'Please enter your full name.'
      if (!email.trim()) return 'Please enter your email.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
      if (password && password.length < 6) return 'Password must be at least 6 characters.'
    }
    if (paymentMethod === 'OFFLINE' && !transactionId.trim()) {
      return 'Please enter the transaction ID from your bank transfer.'
    }
    return null
  }

  async function handleSubmit() {
    const err = validateStep3()
    if (err) {
      toast.error(err)
      return
    }
    if (!selectedChild || !selectedWoman) {
      toast.error('Please select both a child and a woman to sponsor.')
      return
    }
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        childId: selectedChild.id,
        womanId: selectedWoman.id,
        packageId: pkg?.id,
        amountUSD: pkg?.priceUSD ?? 250,
        amountBDT: pkg?.priceBDT ?? 30000,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        donorMessage: message.trim() || undefined,
        anonymous,
      }
      if (!donor) {
        body.donor = {
          name: name.trim(),
          email: email.trim(),
          password: password || undefined,
          phone: phone.trim() || undefined,
          country: country.trim() || undefined,
          city: city.trim() || undefined,
        }
      }
      const res = await api<DonationResponse>('/api/donations', { method: 'POST', json: body })
      setSuccessData(res)
      setStep('success')
      toast.success('Thank you! Your donation is being processed.')
      // refresh auth so donor portal sees the new donation
      await refreshAuth()
      // clear donate selection
      setDonateSelection({})
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Donation failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetFlow() {
    setStep(1)
    setSelectedChildId(undefined)
    setSelectedWomanId(undefined)
    setName('')
    setEmail('')
    setPassword('')
    setPhone('')
    setCountry('')
    setCity('')
    setMessage('')
    setAnonymous(false)
    setPaymentMethod('ONLINE')
    setTransactionId('')
    setSuccessData(null)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <LoadingBlock label="Loading available beneficiaries…" />
      </div>
    )
  }

  if (children.length === 0 || women.length === 0) {
    return <NoAvailabilityView missingChildren={children.length === 0} missingWomen={women.length === 0} onHome={() => go('home')} />
  }

  /* ----- success screen ----- */
  if (step === 'success' && successData) {
    return (
      <SuccessScreen
        donorName={donor?.name ?? name ?? 'Friend'}
        child={selectedChild}
        woman={selectedWoman}
        amountUSD={pkg?.priceUSD ?? 250}
        paymentMethod={paymentMethod}
        onPortal={() => go('donor')}
        onHome={() => go('home')}
      />
    )
  }

  return (
    <div className="bg-background">
      {/* header */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Heart className="h-4 w-4" />
            Sponsor Two Lives
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Complete your sponsorship
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            One donation of <span className="font-semibold text-foreground">{formatUSD(pkg?.priceUSD ?? 250)}</span> gives{' '}
            <span className="font-semibold text-foreground">1 child a year of education</span> and{' '}
            <span className="font-semibold text-foreground">1 woman a 3-month caregiver training</span>.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* stepper */}
        <Stepper step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <StepHeader
                eyebrow="Step 1 of 3"
                title="Choose a child to sponsor"
                description="Pick the child whose story moves you. You'll fund a full year of their education."
                icon={GraduationCap}
              />
              <SelectionGrid
                items={children.map((c) => ({
                  id: c.id,
                  name: c.name,
                  color: c.photoColor,
                  primary: `${c.age} yrs · ${c.location}`,
                  secondary: `Grade ${c.grade}`,
                  tertiary: c.dream,
                  kind: 'CHILD',
                }))}
                selectedId={selectedChildId}
                onSelect={(id) => setSelectedChildId(id)}
              />
              <StepNav
                right={
                  <Button size="lg" disabled={!canAdvanceStep1()} onClick={() => setStep(2)}>
                    Continue to choose a woman <ArrowRight className="h-4 w-4" />
                  </Button>
                }
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <StepHeader
                eyebrow="Step 2 of 3"
                title="Choose a woman to sponsor"
                description="Pick the woman whose goal inspires you. You'll fund her 3-month caregiver training."
                icon={Target}
              />
              <SelectionGrid
                items={women.map((w) => ({
                  id: w.id,
                  name: w.name,
                  color: w.photoColor,
                  primary: `${w.age} yrs · ${w.location}`,
                  secondary: w.familyInfo,
                  tertiary: w.goal,
                  kind: 'WOMAN',
                }))}
                selectedId={selectedWomanId}
                onSelect={(id) => setSelectedWomanId(id)}
              />
              <StepNav
                left={
                  <Button size="lg" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                }
                right={
                  <Button size="lg" disabled={!canAdvanceStep2()} onClick={() => setStep(3)}>
                    Continue to your details <ArrowRight className="h-4 w-4" />
                  </Button>
                }
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="grid gap-6 lg:grid-cols-[1fr_380px]"
            >
              <div className="space-y-6">
                <StepHeader
                  eyebrow="Step 3 of 3"
                  title="Your details & payment"
                  description="Tell us a little about yourself and pick how you'd like to donate."
                  icon={UserCircle2}
                />

                {/* donor info */}
                <Card>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Your information</h3>
                    </div>

                    {donor ? (
                      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                        <ColorAvatar name={donor.name} color={donor.avatarColor} size={40} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium">Donating as {donor.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{donor.email}</div>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                          <CheckCircle2 className="h-3 w-3" /> Signed in
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Full name" required>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Rahman" />
                          </Field>
                          <Field label="Email" required>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
                          </Field>
                          <Field label="Password" hint="6+ chars — creates a donor account to track progress">
                            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
                          </Field>
                          <Field label="Phone" hint="Optional">
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801…" />
                          </Field>
                          <Field label="Country" hint="Optional">
                            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Bangladesh" />
                          </Field>
                          <Field label="City" hint="Optional">
                            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
                          </Field>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
                          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>
                            Your details are kept private and used only to manage your sponsorship. Enter a password to create a donor portal account.
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* payment method */}
                <Card>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Payment method</h3>
                    </div>

                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      <PaymentOption
                        value="ONLINE"
                        title="Online"
                        subtitle="Card / bKash / mobile wallet"
                        icon={CreditCard}
                        active={paymentMethod === 'ONLINE'}
                      />
                      <PaymentOption
                        value="OFFLINE"
                        title="Offline"
                        subtitle="Bank transfer / cash"
                        icon={Building2}
                        active={paymentMethod === 'OFFLINE'}
                      />
                    </RadioGroup>

                    {paymentMethod === 'ONLINE' ? (
                      <div className="rounded-xl border border-border bg-secondary/40 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Online payment
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          You'll be redirected to our secure payment partner to complete your donation by card, bKash, or mobile wallet. After payment, paste the transaction reference below.
                        </p>
                        <Field label="Transaction reference (optional)" hint="If you've already paid, enter the reference ID">
                          <Input
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="TXN-XXXX-XXXX"
                          />
                        </Field>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Bank transfer instructions
                        </div>
                        <div className="grid gap-1.5 rounded-lg border border-border bg-background p-3 text-sm">
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Bank</span>
                            <span className="font-medium">XXX Bank Ltd.</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Account name</span>
                            <span className="font-medium">Sombhabona × SDC</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Account no.</span>
                            <span className="font-medium">XXXX XXXX XXXX</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Reference</span>
                            <span className="font-medium">Your email address</span>
                          </div>
                        </div>
                        <Field label="Transaction ID" required hint="Enter the ID from your transfer receipt">
                          <Input
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. TRF-12345678"
                          />
                        </Field>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* message + anonymous */}
                <Card>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">A message for them (optional)</h3>
                    </div>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Wishing you a bright future — I'm cheering for you both!"
                      className="min-h-24"
                    />
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={anonymous}
                        onCheckedChange={(v) => setAnonymous(v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-sm">
                        <span className="font-medium">Donate anonymously.</span>{' '}
                        <span className="text-muted-foreground">Your name will not be shown publicly on the donor list, but you'll still receive updates.</span>
                      </span>
                    </label>
                  </CardContent>
                </Card>

                {/* mobile nav */}
                <StepNav
                  className="lg:hidden"
                  left={
                    <Button size="lg" variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  }
                  right={
                    <Button size="lg" disabled={submitting} onClick={handleSubmit}>
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" /> Donate {formatUSD(pkg?.priceUSD ?? 250)}
                        </>
                      )}
                    </Button>
                  }
                />
              </div>

              {/* summary sidebar */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <Card className="border-primary/20">
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <HandHeart className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Your sponsorship</h3>
                    </div>

                    <SummaryRow
                      icon={GraduationCap}
                      title="Child"
                      name={selectedChild?.name ?? '—'}
                      sub={selectedChild ? `Grade ${selectedChild.grade} · ${selectedChild.location}` : 'Not selected'}
                      color={selectedChild?.photoColor}
                    />
                    <SummaryRow
                      icon={Target}
                      title="Woman"
                      name={selectedWoman?.name ?? '—'}
                      sub={selectedWoman ? `${selectedWoman.familyInfo} · ${selectedWoman.location}` : 'Not selected'}
                      color={selectedWoman?.photoColor}
                    />

                    <Separator />

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Package</span>
                        <span className="font-medium text-right">{pkg?.name ?? 'One Donation, Two Lives'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-medium">{paymentMethod === 'ONLINE' ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Total due</div>
                        <div className="text-3xl font-bold text-primary">{formatUSD(pkg?.priceUSD ?? 250)}</div>
                        <div className="text-xs text-muted-foreground">≈ {formatBDT(pkg?.priceBDT ?? 30000)}</div>
                      </div>
                      <ShieldCheck className="h-8 w-8 text-primary/40" />
                    </div>

                    <Button
                      size="lg"
                      className="hidden w-full lg:flex"
                      disabled={submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" /> Donate {formatUSD(pkg?.priceUSD ?? 250)} & Change Two Lives
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Your donation is securely processed. You'll get a receipt and donor portal access.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ============== private subcomponents ============== */

function Stepper({ step }: { step: Step }) {
  const steps: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: 'Choose child' },
    { n: 2, label: 'Choose woman' },
    { n: 3, label: 'Your details' },
  ]
  const current = step === 'success' ? 4 : step
  return (
    <div className="mb-8 flex items-center justify-center">
      <ol className="flex w-full max-w-2xl items-center">
        {steps.map((s, i) => {
          const done = current > s.n
          const active = current === s.n
          return (
            <li key={s.n} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    done
                      ? 'bg-primary text-primary-foreground'
                      : active
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : s.n}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    active || done ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: done ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function StepHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
        <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-balance">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

interface SelectionItem {
  id: string
  name: string
  color: string
  primary: string
  secondary: string
  tertiary: string
  kind: 'CHILD' | 'WOMAN'
}

function SelectionGrid({
  items,
  selectedId,
  onSelect,
}: {
  items: SelectionItem[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Select a beneficiary"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((it) => {
        const selected = selectedId === it.id
        return (
          <button
            key={it.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(it.id)}
            className={`group flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft ${
              selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'
            }`}
          >
            <ColorAvatar name={it.name} color={it.color} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{it.name}</span>
                {selected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    <CheckCircle2 className="h-3 w-3" /> Selected
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{it.primary}</div>
              <div className="mt-0.5 text-xs">{it.secondary}</div>
              <div className="mt-1.5 truncate text-xs font-medium text-primary">
                {it.kind === 'CHILD' ? 'Dreams of' : 'Goal:'} {it.tertiary}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function StepNav({
  left,
  right,
  className,
}: {
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mt-6 flex items-center justify-between gap-3 ${className ?? ''}`}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  )
}

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function PaymentOption({
  value,
  title,
  subtitle,
  icon: Icon,
  active,
}: {
  value: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}) {
  return (
    <Label
      htmlFor={`pm-${value}`}
      className={`cursor-pointer rounded-xl border p-3 transition-all ${
        active ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value={value} id={`pm-${value}`} />
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </Label>
  )
}

function SummaryRow({
  icon: Icon,
  title,
  name,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  name: string
  sub: string
  color?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        {color ? (
          <div className="mt-1 flex items-center gap-2">
            <ColorAvatar name={name} color={color} size={28} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{name}</div>
              <div className="truncate text-xs text-muted-foreground">{sub}</div>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-sm font-semibold text-muted-foreground">{name}</div>
        )}
      </div>
    </div>
  )
}

function NoAvailabilityView({
  missingChildren,
  missingWomen,
  onHome,
}: {
  missingChildren: boolean
  missingWomen: boolean
  onHome: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20">
      <Card className="border-primary/20">
        <CardContent className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">All current beneficiaries are sponsored</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {missingChildren && missingWomen
              ? 'Every child and every woman on our platform is currently supported. New beneficiaries are added regularly — please check back soon, or browse our community impact below.'
              : missingChildren
                ? 'Every child is currently sponsored, but you can still meet the women waiting for training.'
                : 'Every woman is currently in training, but you can still meet the children waiting for school.'}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={onHome}>Back to home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SuccessScreen({
  donorName,
  child,
  woman,
  amountUSD,
  paymentMethod,
  onPortal,
  onHome,
}: {
  donorName: string
  child: Child | null
  woman: Woman | null
  amountUSD: number
  paymentMethod: PaymentMethod
  onPortal: () => void
  onHome: () => void
}) {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <PartyPopper className="absolute left-10 top-10 h-20 w-20" />
          <Sparkles className="absolute right-10 top-16 h-16 w-16" />
          <Heart className="absolute bottom-8 left-1/4 h-12 w-12" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-300 text-primary shadow-lg"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Thank you, {donorName.split(' ')[0]}!
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/85 text-balance">
            Your donation of <span className="font-semibold text-white">{formatUSD(amountUSD)}</span> is being processed{paymentMethod === 'OFFLINE' ? ' (offline — we will confirm once verified)' : ''}. You've just changed two lives forever.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="border-primary/20">
            <CardContent>
              <div className="text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Your impact</div>
                <h2 className="mt-1 text-2xl font-bold">You're now sponsoring</h2>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {child && (
                  <ImpactCard
                    icon={GraduationCap}
                    title="A child's education"
                    name={child.name}
                    sub={`Grade ${child.grade} · ${child.location}`}
                    color={child.photoColor}
                    detail={child.dream}
                    detailLabel="Dreams of"
                  />
                )}
                {woman && (
                  <ImpactCard
                    icon={Target}
                    title="A woman's training"
                    name={woman.name}
                    sub={`${woman.familyInfo} · ${woman.location}`}
                    color={woman.photoColor}
                    detail={woman.goal}
                    detailLabel="Goal"
                  />
                )}
              </div>

              <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                We've emailed you a receipt and your donor portal login. Track their progress, milestones, and success stories any time.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onPortal}>
            <UserCircle2 className="h-4 w-4" /> Go to my donor portal
          </Button>
          <Button size="lg" variant="outline" onClick={onHome}>
            Back to home
          </Button>
        </div>
      </section>
    </div>
  )
}

function ImpactCard({
  icon: Icon,
  title,
  name,
  sub,
  color,
  detail,
  detailLabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  name: string
  sub: string
  color: string
  detail: string
  detailLabel: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ColorAvatar name={name} color={color} size={44} />
        <div className="min-w-0">
          <div className="truncate font-semibold">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{sub}</div>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-secondary/60 p-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{detailLabel}</div>
        <div className="text-sm font-medium leading-snug">{detail}</div>
      </div>
    </div>
  )
}
