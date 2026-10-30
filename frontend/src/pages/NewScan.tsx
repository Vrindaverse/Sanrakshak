import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/services/api'
import {
  Search, Globe, Loader2, Shield, Zap, Radar, BugPlay,
  History, ChevronRight,
} from 'lucide-react'

interface Scan {
  id: string
  website: string
  status: string
  score: number | null
  created_at: string
}

const EXAMPLE_URLS = ['https://example.com', 'https://example.org', 'https://example.net']

function getScoreColor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

function getInitials(url: string) {
  return url.replace(/https?:\/\//, '').split('/')[0].charAt(0).toUpperCase()
}

export default function NewScan() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scans, setScans] = useState<Scan[]>([])
  const [scansLoading, setScansLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/history')
      .then((res) => setScans(res.data))
      .catch(() => setScans([]))
      .finally(() => setScansLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }

    setLoading(true)
    try {
      const res = await api.post('/scan', { website: formattedUrl })
      navigate(`/scan/${res.data.id}`)
    } catch {
      setError('Failed to start scan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="p-2 rounded-lg border inline-flex mb-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">New Security Scan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter a website URL to run a comprehensive security assessment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Target Website
          </CardTitle>
          <CardDescription>
            We will scan for open ports, vulnerabilities, misconfigurations, and security headers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {loading ? 'Scanning...' : 'Start Scan'}
              </Button>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </form>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Quick try:</span>
            {EXAMPLE_URLS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setUrl(example)}
                className="text-xs px-2.5 py-1 rounded-md border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 animate-stagger">
        <Card>
          <CardHeader>
            <div className="p-2 rounded-lg border w-fit mb-2">
              <Radar className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-sm">Port Scanning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detect open ports and running services using Nmap
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="p-2 rounded-lg border w-fit mb-2">
              <BugPlay className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-sm">Vulnerability Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identify misconfigurations and known vulnerabilities with Nikto
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="p-2 rounded-lg border w-fit mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-sm">Web Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Test for SQLi, XSS, and missing security headers with OWASP ZAP
            </p>
          </CardContent>
        </Card>
      </div>

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
          {scansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="p-3 rounded-full border inline-flex mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium">No scans yet</h3>
              <p className="text-xs text-muted-foreground mt-1">Start your first security scan</p>
            </div>
          ) : (
            <div className="divide-y">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer group"
                  onClick={() => navigate(`/scan/${scan.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0 ${
                      scan.status === 'completed'
                        ? scan.score && scan.score >= 80
                          ? 'border-success/30 text-success bg-success/10'
                          : scan.score && scan.score >= 50
                            ? 'border-warning/30 text-warning bg-warning/10'
                            : 'border-destructive/30 text-destructive bg-destructive/10'
                        : scan.status === 'running'
                          ? 'border-ice/30 text-ice bg-ice/10'
                          : 'border-border text-muted-foreground'
                    }`}>
                      {getInitials(scan.website)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{scan.website}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(scan.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {scan.status === 'running' ? (
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        <Badge variant="info" className="animate-pulse text-[10px] px-1.5 py-0">Scanning</Badge>
                      </div>
                    ) : scan.status === 'completed' ? (
                      <>
                        {scan.score !== null && (
                          <span className={`text-xs font-semibold ${getScoreColor(scan.score)}`}>
                            {scan.score}/100
                          </span>
                        )}
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">Completed</Badge>
                      </>
                    ) : (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Failed</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
