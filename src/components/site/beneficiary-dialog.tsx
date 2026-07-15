'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { api, formatDate, timeAgo } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ColorAvatar, StatusBadge, ProgressBlock } from '@/components/site/primitives'
import { Heart, MapPin, School, GraduationCap, Target, Users, Sparkles, CheckCircle2, Calendar } from 'lucide-react'

interface ChildDetail {
  id: string; name: string; age: number; gender: string; grade: string; school: string; location: string
  background: string; dream: string; photoColor: string; status: string; progressPercent: number
  updates: { id: string; title: string; content: string; milestone: boolean; createdAt: string; photoColor: string }[]
  donations: { id: string; createdAt: string; amountUSD: number; anonymous: boolean; donor?: { name: string } | null }[]
}
interface WomanDetail {
  id: string; name: string; age: number; location: string; familyInfo: string; background: string; goal: string
  photoColor: string; status: string; progressPercent: number
  updates: { id: string; title: string; content: string; milestone: boolean; createdAt: string; photoColor: string }[]
  donations: { id: string; createdAt: string; amountUSD: number; anonymous: boolean; donor?: { name: string } | null }[]
}

export function BeneficiaryDialog() {
  const { selectedBeneficiary, closeBeneficiary, setDonateSelection, go } = useAppStore()
  const open = !!selectedBeneficiary
  const [data, setData] = React.useState<ChildDetail | WomanDetail | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!selectedBeneficiary) {
      setData(null)
      return
    }
    setLoading(true)
    setData(null)
    const path =
      selectedBeneficiary.type === 'CHILD'
        ? `/api/children/${selectedBeneficiary.id}`
        : `/api/women/${selectedBeneficiary.id}`
    api<ChildDetail | WomanDetail>(path)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [selectedBeneficiary])

  const isChild = selectedBeneficiary?.type === 'CHILD'
  const beneficiary = data as (ChildDetail & { _kind?: 'CHILD' }) | (WomanDetail & { _kind?: 'WOMAN' }) | null

  function handleSponsor() {
    if (!selectedBeneficiary) return
    setDonateSelection({
      childId: selectedBeneficiary.type === 'CHILD' ? selectedBeneficiary.id : undefined,
      womanId: selectedBeneficiary.type === 'WOMAN' ? selectedBeneficiary.id : undefined,
    })
    closeBeneficiary()
    go('donate')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeBeneficiary()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!loading && beneficiary && (
          <>
            {/* header banner */}
            <div className="relative h-32" style={{ background: `linear-gradient(135deg, ${beneficiary.photoColor}, ${beneficiary.photoColor}99)` }}>
              <div className="absolute inset-0 bg-grid opacity-20" />
            </div>
            <div className="px-6 pb-6 -mt-12 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 8rem)' }}>
              <div className="flex items-end gap-4">
                <ColorAvatar name={beneficiary.name} color={beneficiary.photoColor} size={88} className="ring-4 ring-background" />
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold">{beneficiary.name}</h2>
                    <StatusBadge status={beneficiary.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {beneficiary.location} · {beneficiary.age} yrs
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {isChild ? (
                  <>
                    <InfoTile icon={GraduationCap} label="Grade" value={(beneficiary as ChildDetail).grade} />
                    <InfoTile icon={School} label="School" value={(beneficiary as ChildDetail).school} />
                    <InfoTile icon={Sparkles} label="Dream" value={(beneficiary as ChildDetail).dream} />
                  </>
                ) : (
                  <>
                    <InfoTile icon={Users} label="Family" value={(beneficiary as WomanDetail).familyInfo} />
                    <InfoTile icon={Target} label="Goal" value={(beneficiary as WomanDetail).goal} />
                  </>
                )}
                <InfoTile icon={Calendar} label="Joined" value={formatDate((beneficiary as any).createdAt || new Date().toISOString())} />
              </div>

              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Background</div>
                <p className="text-sm leading-relaxed">{beneficiary.background}</p>
              </div>

              <div className="mt-4">
                <ProgressBlock value={beneficiary.progressPercent} label={isChild ? 'Education progress' : 'Training progress'} />
              </div>

              {/* Updates */}
              {beneficiary.updates.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Progress Updates</h3>
                  <div className="space-y-3">
                    {beneficiary.updates.map((u) => (
                      <div key={u.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {u.milestone ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-semibold text-sm">{u.title}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{timeAgo(u.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{u.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporters */}
              {beneficiary.donations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Supporters</h3>
                  <div className="flex flex-wrap gap-2">
                    {beneficiary.donations.map((d) => (
                      <span key={d.id} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                        <Heart className="h-3 w-3 text-primary" />
                        {d.anonymous ? 'Anonymous' : d.donor?.name ?? 'Supporter'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {beneficiary.status === 'AVAILABLE' && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1" onClick={handleSponsor}>
                    <Heart className="h-4 w-4 mr-2" /> Sponsor this {isChild ? 'child' : 'woman'}
                  </Button>
                  <Button size="lg" variant="outline" onClick={closeBeneficiary}>
                    Close
                  </Button>
                </div>
              )}
              {beneficiary.status !== 'AVAILABLE' && (
                <div className="mt-6">
                  <Button size="lg" variant="outline" className="w-full" onClick={closeBeneficiary}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
