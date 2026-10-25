import { type ReactNode } from 'react'
import { Shield } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-7 w-7" />
        <span className="text-2xl font-bold">Sanrakshak</span>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Protect. Analyze. Secure.
      </p>
    </div>
  )
}
