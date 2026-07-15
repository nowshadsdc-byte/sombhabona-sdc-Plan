'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAppStore, type View } from '@/store/app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { BeneficiaryDialog } from '@/components/site/beneficiary-dialog'
import { ColorAvatar } from '@/components/site/primitives'
import { toast } from 'sonner'
import {
  Heart,
  Menu,
  Home as HomeIcon,
  Users,
  HandHeart,
  UserCircle2,
  Shield,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import { useTheme } from 'next-themes'

const NAV: { view: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { view: 'home', label: 'Home', icon: HomeIcon },
  { view: 'beneficiaries', label: 'Beneficiaries', icon: Users },
  { view: 'donate', label: 'Donate', icon: HandHeart },
  { view: 'donors', label: 'Donors', icon: Sparkles },
  { view: 'donor', label: 'Donor Portal', icon: UserCircle2 },
  { view: 'admin', label: 'Admin', icon: Shield },
]

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { view, go, donor, admin, refreshAuth, loadContent } = useAppStore()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    refreshAuth()
    loadContent()
  }, [refreshAuth, loadContent])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await refreshAuth()
      toast.success('Signed out')
      go('home')
    } catch {
      toast.error('Could not sign out')
    }
  }

  function NavButton({ item }: { item: (typeof NAV)[number] }) {
    const active = view === item.view
    return (
      <button
        onClick={() => {
          go(item.view)
          setMobileOpen(false)
        }}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </button>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center">
          <Heart className="h-3.5 w-3.5" />
          <span className="font-medium">One Donation. Two Lives Changed. A Future Filled with Hope.</span>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <button onClick={() => go('home')} className="flex items-center gap-2.5 shrink-0">
            <div className="flex -space-x-2">
              <Image src="/sombhabona_logo.webp" alt="Sombhabona" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-background" />
              <Image src="/sdc-logo.png" alt="Skills Development Centre" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-background" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-bold text-foreground">Sombhabona × SDC</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Joint Initiative</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="ml-auto hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <NavButton key={item.view} item={item} />
            ))}
          </nav>

          <div className="ml-auto lg:ml-2 flex items-center gap-2">
            {/* theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* auth status */}
            {donor ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => go('donor')}
                  className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 hover:bg-accent transition-colors"
                >
                  <ColorAvatar name={donor.name} color={donor.avatarColor} size={28} />
                  <span className="text-sm font-medium max-w-[8rem] truncate">{donor.name}</span>
                </button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : admin ? (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => go('admin')} className="gap-2">
                  <Shield className="h-4 w-4" /> Admin
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => go('donor')} className="hidden sm:inline-flex">
                <UserCircle2 className="h-4 w-4 mr-1.5" /> Donor Login
              </Button>
            )}

            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="#donate" onClick={() => go('donate')}>
                <Heart className="h-4 w-4 mr-1.5" /> Donate Now
              </Link>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="px-5 pt-5 pb-3 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Image src="/sombhabona_logo.webp" alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover ring-2 ring-background" />
                      <Image src="/sdc-logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover ring-2 ring-background" />
                    </div>
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {NAV.map((item) => (
                    <NavButton key={item.view} item={item} />
                  ))}
                  {donor && (
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" /> Sign out ({donor.name.split(' ')[0]})
                    </button>
                  )}
                  {admin && (
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" /> Admin sign out
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Beneficiary detail dialog (global) */}
      <BeneficiaryDialog />

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Image src="/sombhabona_logo.webp" alt="Sombhabona" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-background" />
                  <Image src="/sdc-logo.png" alt="SDC" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-background" />
                </div>
                <div>
                  <div className="text-base font-bold">Sombhabona × SDC</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Joint Initiative</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
                One Donation, Change Two Lives — a joint initiative of Sombhabona and Skills Development Centre (SDC). A single donation of USD 250 gives one child a year of education and one woman a 3-month caregiver training program.
              </p>
              <p className="mt-4 text-sm font-semibold text-primary">One Donation. Two Lives Changed. A Future Filled with Hope.</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {NAV.map((n) => (
                  <li key={n.view}>
                    <button onClick={() => go(n.view)} className="hover:text-primary transition-colors">{n.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">The Package</h4>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="text-2xl font-bold text-primary">USD 250</div>
                <div className="text-xs text-muted-foreground">≈ BDT 30,000</div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-start gap-2"><span className="text-primary">✓</span> 1 child · 1 year of education</div>
                  <div className="flex items-start gap-2"><span className="text-primary">✓</span> 1 woman · 3-month caregiver training</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Sombhabona × Skills Development Centre. All rights reserved.</p>
            <p>Implemented by Sombhabona · Built with transparency & accountability.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
