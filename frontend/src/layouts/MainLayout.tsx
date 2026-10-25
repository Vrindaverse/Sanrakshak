import { type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/useAuth'
import { Wordmark } from '@/components/landing/BrandMark'
import { cn } from '@/lib/utils'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-3.5 py-2 text-sm transition-colors',
      isActive
        ? 'bg-white/[0.06] text-foreground'
        : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
    )

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(50%_100%_at_50%_0%,oklch(0.28_0.05_225_/_0.18),transparent_70%)]"
      />

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[oklch(0.09_0.01_250_/_0.72)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/scan/new" className="group flex items-center" aria-label="Sanrakshak scanner">
            <Wordmark className="transition-opacity group-hover:opacity-80" markClassName="h-7 w-7" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="App">
            <NavLink to="/scan/new" className={navClass}>
              Scanner
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          </nav>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-sm text-muted-foreground sm:block">{user?.name}</span>
            {user?.premium ? (
              <Badge variant="outline" className="border-acid/30 bg-acid/10 px-2 py-0 text-[10px] text-acid">
                Premium
              </Badge>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">{children}</main>

      <footer className="mt-auto border-t border-white/[0.07]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground/60 sm:flex-row md:px-6">
          <p className="type-mono text-[0.58rem] uppercase tracking-[0.18em]">Sanrakshak</p>
          <p className="type-mono inline-flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.18em]">
            <span className="status-dot" />
            Protect / Analyze / Secure
          </p>
        </div>
      </footer>
    </div>
  )
}
