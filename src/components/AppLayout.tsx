import type { ReactNode } from 'react'
import InstitutionalHeader from './InstitutionalHeader'
import InstitutionalFooter from './InstitutionalFooter'

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-[#ffffff]">
      <InstitutionalHeader />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-8 box-border">
        {children}
      </main>
      <InstitutionalFooter />
    </div>
  )
}

export default AppLayout