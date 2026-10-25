import { type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/useAuth'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/scan/new" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6" />
            <span>Sanrakshak</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            {user?.premium && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">Premium</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 py-6">
        {children}
      </main>

      <footer className="border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 text-center text-xs text-muted-foreground">
          Sanrakshak
        </div>
      </footer>
    </div>
  )
}
