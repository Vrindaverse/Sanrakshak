import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/useAuth'
import api from '@/services/api'
import {
  History,
  Shield,
  AlertTriangle,
  FileText,
  Download,
  Gauge,
  Sparkles,
} from 'lucide-react'
import { Counter } from '@/components/landing/Counter'
import { ScanHistory, type Scan } from '@/components/ScanHistory'

function getScoreColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Poor'
}

function getDomain(url: string) {
  return url.replace(/https?:\/\//, '').split('/')[0]
}

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const reduceMotion = useReducedMotion()
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? 'var(--acid)' : score >= 50 ? 'var(--warning)' : 'var(--destructive)'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Gauge className={`h-4 w-4 ${getScoreColor(score)}`} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/history')
      .then((res) => setScans(res.data))
      .catch(() => setScans([]))
      .finally(() => setLoading(false))
  }, [])

  const latestScan = scans[0]
  const latestScore = latestScan?.status === 'completed' ? latestScan.score ?? 0 : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.name}
          </p>
        </div>
        <Button onClick={() => navigate('/scan/new')} className="gap-2">
          <Sparkles className="h-4 w-4" />
          New Scan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 animate-stagger">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestScan && latestScan.score !== null ? (
              <div className="flex items-center gap-4">
                <ScoreRing score={latestScan.score} />
                <div>
                  <div className={`text-xl font-bold ${getScoreColor(latestScan.score)}`}>
                    <Counter to={latestScan.score} pad={0} />/100
                  </div>
                  <Badge
                    variant={latestScan.score >= 80 ? 'success' : latestScan.score >= 50 ? 'warning' : 'destructive'}
                    className="mt-1 text-[10px] px-1.5 py-0"
                  >
                    {getScoreLabel(latestScan.score)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No scans yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">
                <Counter to={latestScore} pad={0} />
              </div>
              <p className="text-xs text-muted-foreground">Latest score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">
                <Counter to={scans.length} pad={0} />
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScanHistory
        scans={scans}
        loading={loading}
        onSelect={(scanId) => navigate(`/scan/${scanId}`)}
        emptyAction={
          <Button size="sm" onClick={() => navigate('/scan/new')} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Start a Scan
          </Button>
        }
      />

      {latestScan && latestScan.status === 'completed' && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Latest Report
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg border">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{latestScan.website}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-semibold ${getScoreColor(latestScan.score!)}`}>
                      Score: {latestScan.score}/100
                    </span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(latestScan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-1.5 flex-1 sm:flex-initial text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button size="sm" className="gap-1.5 flex-1 sm:flex-initial text-xs">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
