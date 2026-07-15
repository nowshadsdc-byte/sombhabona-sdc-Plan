'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { SiteShell } from '@/components/site/site-shell'
import { HomeView } from '@/components/site/views/home-view'
import { BeneficiariesView } from '@/components/site/views/beneficiaries-view'
import { DonateView } from '@/components/site/views/donate-view'
import { DonorView } from '@/components/site/views/donor-view'
import { DonorsView } from '@/components/site/views/donors-view'
import { AdminView } from '@/components/site/views/admin-view'

export default function Home() {
  const view = useAppStore((s) => s.view)

  return (
    <SiteShell>
      {view === 'home' && <HomeView />}
      {view === 'beneficiaries' && <BeneficiariesView />}
      {view === 'donate' && <DonateView />}
      {view === 'donor' && <DonorView />}
      {view === 'donors' && <DonorsView />}
      {view === 'admin' && <AdminView />}
    </SiteShell>
  )
}
