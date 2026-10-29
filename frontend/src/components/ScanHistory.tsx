import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, History, Loader2, Search } from 'lucide-react'
import { EASE_OUT_SOFT } from '@/lib/motion'

export interface Scan {
  id: string
  website: string
  status: string
  score: number | null
  created_at: string
}

function getInitials(url: string) {
  return url.replace(/https?:\/\//, '').split('/')[0].charAt(0).toUpperCase()
}

function scoreTone(scan: Scan) {
  if (scan.status === 'running') return 'border-ice/30 text-ice bg-ice/10'
  if (scan.status !== 'completed') return 'border-border text-muted-foreground'
  if (scan.score !== null && scan.score >= 80) return 'border-success/30 text-success bg-success/10'
  if (scan.score !== null && scan.score >= 50) return 'border-warning/30 text-warning bg-warning/10'
  return 'border-destructive/30 text-destructive bg-destructive/10'
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

interface ScanHistoryProps {
  scans: Scan[]
  loading?: boolean
  onSelect: (id: string) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}

export function ScanHistory({
  scans,
  loading = false,
  onSelect,
  emptyTitle = 'No scans yet',
  emptyDescription = 'Start your first security scan',
  emptyAction,
}: ScanHistoryProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Scan History
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {scans.length} {scans.length === 1 ? 'scan' : 'scans'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="p-3 rounded-full border inline-flex mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">{emptyTitle}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">{emptyDescription}</p>
            {emptyAction}
          </div>
        ) : (
          <div className="divide-y">
            {scans.map((scan, index) => (
              <motion.div
                key={scan.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3), ease: EASE_OUT_SOFT }}
                onClick={() => onSelect(scan.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(scan.id)
                  }
                }}
                className="flex cursor-pointer items-center justify-between p-4 transition-colors duration-200 hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none group"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${scoreTone(scan)}`}
                  >
                    {getInitials(scan.website)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{scan.website}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {scan.status === 'running' ? (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ice opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-ice" />
                      </span>
                      <Badge variant="info" className="animate-pulse px-1.5 py-0 text-[10px]">Scanning</Badge>
                    </div>
                  ) : scan.status === 'completed' ? (
                    <>
                      {scan.score !== null && (
                        <span className={`text-xs font-semibold ${scoreColor(scan.score)}`}>{scan.score}/100</span>
                      )}
                      <Badge variant="success" className="px-1.5 py-0 text-[10px]">Completed</Badge>
                    </>
                  ) : (
                    <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Failed</Badge>
                  )}
                  <ChevronRight className="-mr-1 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
