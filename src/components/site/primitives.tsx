'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { initials as getInitials } from '@/lib/api'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

/* ---------- Avatar ---------- */
export function ColorAvatar({
  name,
  color,
  size = 48,
  className,
}: {
  name: string
  color?: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex items-center justify-center rounded-full font-semibold text-white shrink-0 shadow-sm', className)}
      style={{ background: color ?? '#0d9488', width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  )
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4',
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl text-foreground">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-muted-foreground text-balance">{subtitle}</p>}
    </div>
  )
}

/* ---------- Status badge ---------- */
const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  SUPPORTED: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  GRADUATED: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  EMPLOYED: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-100 text-rose-700 border-rose-200',
}
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border font-medium', STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground', className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}

/* ---------- Progress block ---------- */
export function ProgressBlock({ value, label }: { value: number; label?: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label ?? 'Progress'}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

/* ---------- Eyebrow pill ---------- */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary', className)}>
      {children}
    </span>
  )
}

/* ---------- Stat card ---------- */
export function StatCard({
  value,
  label,
  icon: Icon,
  accent = '#0d9488',
}: {
  value: React.ReactNode
  label: string
  icon?: React.ComponentType<{ className?: string }>
  accent?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ---------- Loading spinner block ---------- */
export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  )
}
