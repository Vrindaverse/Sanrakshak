import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/useAuth'
import api from '@/services/api'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Brain,
  FileText,
  Bug,
  ScanLine,
  Lightbulb,
  Sparkles,
  Terminal,
  Network,
  ScrollText,
  Shield,
  Copy,
  Info,
  Server,
  Lock,
  Cookie,
  Eye,
  Filter,
  AlertCircle,
  LockKeyhole,
  Target,
} from 'lucide-react'
import { jsPDF } from 'jspdf'

interface Vulnerability {
  id: string
  title: string
  severity: string
  description: string
  recommendation: string
  source?: string
}

interface ToolResultInterpretation {
  finding: string
  detail: string
  severity?: string
}

interface ToolResult {
  tool: string
  status: string
  summary: string
  raw: string
  interpretation: ToolResultInterpretation[]
}

interface ScanResult {
  id: string
  website: string
  status: string
  score: number
  created_at: string
  vulnerabilities: Vulnerability[]
  ai_summary?: string
  tool_results?: ToolResult[]
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info']

const SEVERITY_META: Record<string, { label: string; dot: string }> = {
  critical: { label: 'Critical', dot: 'bg-foreground/80' },
  high: { label: 'High', dot: 'bg-foreground/60' },
  medium: { label: 'Medium', dot: 'bg-foreground/40' },
  low: { label: 'Low', dot: 'bg-foreground/20' },
  info: { label: 'Info', dot: 'bg-foreground/10' },
}

function ScoreGauge({ score }: { score: number }) {
  const stroke = 326.7, offset = stroke - (score / 100) * stroke
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--foreground)" strokeWidth="6" strokeLinecap="round" strokeDasharray={stroke} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl sm:text-2xl font-bold">{score}</span>
        <span className="text-[9px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

const TOOL_META: Record<string, { icon: React.ElementType; label: string }> = {
  Nmap: { icon: Network, label: 'Port & Service Discovery' },
  Nikto: { icon: Bug, label: 'Web Server Vulnerability Scanner' },
  'OWASP ZAP': { icon: Shield, label: 'Web Application Security Testing' },
}

const FINDING_ICONS: Record<string, React.ElementType> = {
  'Port 80 (HTTP) is open': Server, 'Port 443 (HTTPS) is open': Lock, 'Port 22 (SSH) is exposed to the internet': AlertCircle,
  'Apache 2.4.41 detected': Eye, '997 filtered ports': Shield, 'Missing X-Content-Type-Options header': Filter,
  'Cookie missing Secure flag': Cookie, 'Server version is visible': Eye, 'Missing HSTS header': Lock,
  'Missing HSTS (Strict-Transport-Security) header': Lock, 'Application Error Disclosure': AlertTriangle,
  'Cookie without HttpOnly flag': Cookie, 'Missing X-Content-Type-Options': Filter,
}

function TerminalBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded border border-[#30363d] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" /><span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" /></div>
          <span className="text-[11px] text-[#8b949e] font-mono ml-2">bash</span>
        </div>
        <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="text-[#8b949e] hover:text-[#f0f6fc] text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#30363d]">
          {copied ? <span className="text-green-400">Copied</span> : <><Copy className="h-3 w-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-3 text-xs text-[#e6edf3] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap bg-[#0d1117]">{text}</pre>
    </div>
  )
}

function SeverityBar({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  vulnerabilities.forEach((v) => { counts[v.severity.toLowerCase()] = (counts[v.severity.toLowerCase()] || 0) + 1 })
  const total = vulnerabilities.length || 1
  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden border">
        {SEVERITY_ORDER.map((s) => {
          const count = counts[s] || 0
          if (count === 0) return null
          const shades: Record<string, string> = { critical: 'bg-foreground/80', high: 'bg-foreground/60', medium: 'bg-foreground/40', low: 'bg-foreground/20', info: 'bg-foreground/10' }
          return <div key={s} className={shades[s]} style={{ width: `${(count / total) * 100}%` }} />
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {SEVERITY_ORDER.map((s) => {
          const count = counts[s] || 0
          const shades: Record<string, string> = { critical: 'bg-foreground/80', high: 'bg-foreground/60', medium: 'bg-foreground/40', low: 'bg-foreground/20', info: 'bg-foreground/10' }
          return <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`w-2 h-2 rounded-full ${shades[s]}`} /><span>{count} {s}</span></div>
        })}
      </div>
    </div>
  )
}

type ReportView = 'raw' | 'text' | 'vulns' | 'ai'

export default function ScanResults() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<ReportView>('vulns')

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const res = await api.get(`/scan/${id}`)
        setScan(res.data)
        setError(null)
      } catch {
        setScan(null)
        setError('Failed to load scan results. It may have failed or been removed.')
      } finally {
        setLoading(false)
      }
    }
    fetchScan()
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/scan/${id}`)
        setScan(res.data)
        setError(null)
        if (res.data.status === 'completed' || res.data.status === 'failed') clearInterval(interval)
      } catch {
        clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [id, navigate])

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="flex flex-col items-center justify-center text-center space-y-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-foreground/10 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-foreground/30 animate-[spin_2s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center"><ScanLine className="h-5 w-5 text-muted-foreground" /></div>
        </div>
        <div>
          <p className="text-sm font-medium">Loading Scan Results</p>
          <p className="text-xs text-muted-foreground mt-1">Fetching your security assessment data...</p>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <Card><CardContent className="py-12 sm:py-16 text-center"><AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" /><h2 className="text-sm sm:text-base font-semibold mb-1">Unable to load results</h2><p className="text-xs sm:text-sm text-muted-foreground mb-4">{error}</p><Button size="sm" onClick={() => navigate('/scan/new')} className="gap-1.5"><Target className="h-3.5 w-3.5" /> Start New Scan</Button></CardContent></Card>
    </div>
  )

  if (!scan) return null

  const progress = scan.status === 'completed' ? 100 : scan.status === 'failed' ? 0 : 50

  const severityCount = (s: string) => scan.vulnerabilities?.filter((v) => v.severity.toLowerCase() === s.toLowerCase()).length || 0
  const groupedVulns = SEVERITY_ORDER.map((s) => ({ severity: s, items: scan.vulnerabilities?.filter((v) => v.severity.toLowerCase() === s) || [] })).filter((g) => g.items.length > 0)
  const toolResults = scan.tool_results

  const downloadReport = (format: string) => {
    const date = new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const vulnRows = scan.vulnerabilities?.map((v, i) => `${i + 1}. [${v.severity.toUpperCase()}] ${v.title}\n   ${v.description}\n   Fix: ${v.recommendation}`).join('\n\n') || ''
    const content: Record<string, string> = {
      md: `# Security Scan Report - ${scan.website}\n\n**Date:** ${date}\n**Score:** ${scan.score}/100\n\n## Vulnerabilities\n\n${vulnRows}\n\n## AI Analysis\n\n${scan.ai_summary || 'N/A'}`,
      html: `<html><head><title>Security Report - ${scan.website}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#333}h1{color:#000}.score{font-size:24px;font-weight:bold}.vuln{border:1px solid #ddd;padding:12px 16px;margin:8px 0;border-left:3px solid #000}.severity{font-size:11px;font-weight:600;padding:2px 8px;background:#f5f5f5;border-radius:4px}.rec{border-left:3px solid #999;background:#f9f9f9;padding:8px 12px;margin-top:8px}</style></head><body><h1>Security Scan Report</h1><p><strong>Website:</strong> ${scan.website}</p><p><strong>Date:</strong> ${date}</p><p class="score">Score: ${scan.score}/100</p><h2>Vulnerabilities (${scan.vulnerabilities?.length || 0})</h2>${scan.vulnerabilities?.map(v => `<div class="vuln"><div style="display:flex;justify-content:space-between;align-items:start"><strong>${v.title}</strong><span class="severity">${v.severity}</span></div><p style="color:#666;font-size:14px">${v.description}</p>${v.source ? `<p style="font-size:12px;color:#999;margin-top:4px">Source: ${v.source}</p>` : ''}<div class="rec"><strong>Recommendation:</strong> ${v.recommendation}</div></div>`).join('')}<h2>AI Analysis</h2><pre style="white-space:pre-wrap;font-size:14px;background:#f5f5f5;padding:16px">${scan.ai_summary || 'N/A'}</pre></body></html>`,
    }
    const blob = new Blob([content[format]], { type: format === 'html' ? 'text/html' : 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sanrakshak-report-${scan.website.replace(/https?:\/\//, '').replace(/[./]/g, '-')}.${format === 'html' ? 'html' : 'md'}`
    a.click(); URL.revokeObjectURL(a.href)
  }

  const downloadPdf = () => {
    const doc = new jsPDF()
    const date = new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const pageW = doc.internal.pageSize.getWidth(), margin = 20; let y = margin + 10
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('Security Scan Report', margin, y); y += 10
    doc.setDrawColor(150); doc.line(margin, y, pageW - margin, y); y += 8
    doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.text(`Website: ${scan.website}`, margin, y); y += 6; doc.text(`Date: ${date}`, margin, y); y += 6; doc.text(`Score: ${scan.score}/100`, margin, y); y += 10
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(`Vulnerabilities (${scan.vulnerabilities?.length || 0})`, margin, y); y += 8
    scan.vulnerabilities?.forEach((v) => {
      if (y > 255) { doc.addPage(); y = margin + 10 }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(0)
      const t = doc.splitTextToSize(`[${v.severity.toUpperCase()}] ${v.title}`, pageW - margin * 2); doc.text(t, margin, y); y += t.length * 5 + 2
      doc.setTextColor(80); doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
      const d = doc.splitTextToSize(v.description, pageW - margin * 2); doc.text(d, margin, y); y += d.length * 4 + 2
      doc.setTextColor(60); const f = doc.splitTextToSize(`Fix: ${v.recommendation}`, pageW - margin * 2); doc.text(f, margin, y); y += f.length * 4 + 5
    })
    if (scan.ai_summary) {
      if (y > 230) { doc.addPage(); y = margin + 10 }
      y += 4; doc.setDrawColor(150); doc.line(margin, y, pageW - margin, y); y += 8
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('AI Summary', margin, y); y += 8
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
      const aiLines = doc.splitTextToSize(scan.ai_summary.replace(/[*#]/g, ''), pageW - margin * 2)
      for (const line of aiLines) {
        if (y > 285) { doc.addPage(); y = margin + 10 }
        doc.text(line, margin, y); y += 5
      }
    }
    doc.save(`sanrakshak-report-${scan.website.replace(/https?:\/\//, '').replace(/[./]/g, '-')}.pdf`)
  }

  if (scan.status === 'running') {
    const steps = [
      { label: 'Nmap', sub: 'Port & Service Discovery', status: 'active' },
      { label: 'Nikto', sub: 'Web Server Vulnerability Scanner', status: 'active' },
      { label: 'OWASP ZAP', sub: 'Web Application Security Testing', status: 'pending' },
      { label: 'Gemini AI', sub: 'Report Generation & Analysis', status: 'pending' },
    ]

    return (
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8"><Button variant="ghost" onClick={() => navigate('/scan/new')} className="gap-1.5 -ml-2 text-sm"><ArrowLeft className="h-4 w-4" /> Back</Button></div>
          <Card className="overflow-hidden border-muted/30">
            <div className="h-1 bg-muted/20">
              <div className="h-full bg-foreground/20 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <CardContent className="py-12 sm:py-16">
            <div className="max-w-md mx-auto text-center space-y-10">
              <div className="space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-foreground/10 animate-[spin_3s_linear_infinite]" />
                  <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-foreground/30 animate-[spin_2s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center"><ScanLine className="h-6 w-6 text-muted-foreground" /></div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Scan in Progress</h2>
                  <p className="text-sm text-muted-foreground mt-1">Running security assessments on <span className="font-medium text-foreground/80">{scan.website}</span></p>
                </div>
              </div>

              <div className="space-y-3 text-left">
                {steps.map((step) => (
                  <div key={step.label} className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-500 ${step.status === 'active' ? 'border-foreground/20 bg-muted/10' : step.status === 'done' ? 'border-muted/20 bg-muted/5' : 'border-muted/10 opacity-50'}`}>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-500 ${step.status === 'done' ? 'border-foreground/30 bg-foreground/10' : step.status === 'active' ? 'border-foreground/40' : 'border-muted/20'}`}>
                      {step.status === 'done' ? <span className="text-[9px] text-foreground/60">&#10003;</span> : step.status === 'active' ? <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${step.status === 'done' ? 'text-foreground/80' : step.status === 'active' ? 'text-foreground' : 'text-muted-foreground/60'}`}>{step.label}</p>
                      <p className="text-[10px] text-muted-foreground/50">{step.sub}</p>
                    </div>
                    <span className={`text-[10px] ${step.status === 'done' ? 'text-foreground/30' : step.status === 'active' ? 'text-foreground/50' : 'text-muted-foreground/30'}`}>
                      {step.status === 'done' ? 'Done' : step.status === 'active' ? 'Scanning...' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (scan.status !== 'completed') return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-6"><Button variant="ghost" onClick={() => navigate('/scan/new')} className="gap-1.5 -ml-2 text-sm"><ArrowLeft className="h-4 w-4" /> Back</Button></div>
      <Card><CardContent className="py-8 sm:py-12 text-center"><AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-muted-foreground mb-3" /><h2 className="text-sm sm:text-base font-semibold mb-1">Scan Failed</h2><p className="text-xs sm:text-sm text-muted-foreground mb-4">The scan could not be completed.</p><Button size="sm" onClick={() => navigate('/scan/new')} className="gap-1.5"><Target className="h-3.5 w-3.5" /> Start New Scan</Button></CardContent></Card>
    </div>
  )

  const views: { key: ReportView; label: string; icon: React.ElementType }[] = [
    { key: 'raw', label: 'Raw Report', icon: Terminal },
    { key: 'text', label: 'Text Report', icon: ScrollText },
    { key: 'vulns', label: 'Vulnerabilities', icon: Bug },
    { key: 'ai', label: 'AI Report', icon: Brain },
  ]

  const isPremium = user?.premium === true

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate('/scan/new')} className="gap-1.5 -ml-2 text-sm"><ArrowLeft className="h-4 w-4" /> New Scan</Button>
      </div>

      <div className="border-b pb-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{scan.website}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Scanned on {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 w-fit">Completed</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Security Score</CardTitle></CardHeader><CardContent className="flex justify-center py-2"><ScoreGauge score={scan.score} /></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Critical / High</CardTitle></CardHeader><CardContent className="pt-2"><div className="text-xl font-bold">{severityCount('critical') + severityCount('high')}</div><p className="text-xs text-muted-foreground mt-0.5">vulnerabilities</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Medium / Low</CardTitle></CardHeader><CardContent className="pt-2"><div className="text-xl font-bold">{severityCount('medium') + severityCount('low')}</div><p className="text-xs text-muted-foreground mt-0.5">vulnerabilities</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle></CardHeader><CardContent className="pt-2"><div className="text-xl font-bold">{scan.vulnerabilities?.length || 0}</div><p className="text-xs text-muted-foreground mt-0.5">findings</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-0.5 rounded border w-fit mb-6 bg-muted/20">
        {views.map((v) => {
          const Icon = v.icon
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                view === v.key ? 'bg-background border shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {v.label}
              {v.key === 'ai' && !isPremium && <LockKeyhole className="h-3 w-3 text-muted-foreground" />}
            </button>
          )
        })}
      </div>

      {view === 'raw' && (
        <div className="space-y-4">
          {toolResults && toolResults.length > 0 ? (
            toolResults.map((tool) => {
              const meta = TOOL_META[tool.tool] || { icon: Terminal, label: '' }
              const Icon = meta.icon
              return (
                <Card key={tool.tool}>
                  <CardHeader className="pb-2 border-b bg-muted/10">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      <span className="text-[11px] sm:text-xs font-semibold">{tool.tool}</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">{meta.label}</span>
                      {tool.status === 'not_installed' ? (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 ml-auto border-dashed">Not Installed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 ml-auto">{tool.summary}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {tool.status === 'not_installed' ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground"><span className="font-mono">{tool.raw}</span></p>
                      </div>
                    ) : (
                      <TerminalBlock text={tool.raw} />
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card><CardContent className="py-12 text-center"><Terminal className="h-8 w-8 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Raw tool output not available</p></CardContent></Card>
          )}
        </div>
      )}

      {view === 'text' && (
        <div className="space-y-4">
          {toolResults && toolResults.length > 0 ? (
            toolResults.map((tool) => {
              const meta = TOOL_META[tool.tool] || { icon: Terminal, label: '' }
              const Icon = meta.icon
              return (
                <Card key={tool.tool}>
                  <CardHeader className="pb-2 border-b bg-muted/10">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      <span className="text-[11px] sm:text-xs font-semibold">{tool.tool}</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">{meta.label}</span>
                      {tool.status === 'not_installed' ? (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 ml-auto border-dashed">Not Installed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 ml-auto">{tool.summary}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {tool.interpretation.length > 0 ? tool.interpretation.map((item, i) => {
                      const FindingIcon = FINDING_ICONS[item.finding] || Info
                      return (
                        <div key={i} className={`px-4 py-3.5 ${i < tool.interpretation.length - 1 ? 'border-b' : ''} hover:bg-muted/20 transition-colors`}>
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded border bg-muted/20 flex items-center justify-center shrink-0 mt-0.5"><FindingIcon className="h-3.5 w-3.5 text-muted-foreground" /></div>
                            <div><p className="text-sm font-medium">{item.finding}</p><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</p></div>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="py-6 text-center"><p className="text-xs text-muted-foreground">No findings from this tool.</p></div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card><CardContent className="py-12 text-center"><ScrollText className="h-8 w-8 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Text interpretation not available</p></CardContent></Card>
          )}
        </div>
      )}

      {view === 'vulns' && (
        <div className="space-y-4">
          {(scan.vulnerabilities ?? []).length > 0 ? (
            <>
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><Bug className="h-4 w-4 text-muted-foreground" /> Vulnerability Report</CardTitle>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{scan.vulnerabilities.length} total</Badge>
                  </div>
                  <div className="mt-3"><SeverityBar vulnerabilities={scan.vulnerabilities} /></div>
                </CardHeader>
                <div className="divide-y">
                  {groupedVulns.map((group) => (
                    <div key={group.severity}>
                      <div className="px-4 py-2 bg-muted/20 border-y flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${SEVERITY_META[group.severity].dot}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider">{SEVERITY_META[group.severity].label}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">{group.items.length}</Badge>
                      </div>
                      {group.items.map((vuln) => {
                        const s = SEVERITY_META[vuln.severity.toLowerCase()] || SEVERITY_META.low
                        return (
                          <div key={vuln.id} className="p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                <div><h3 className="text-sm font-medium">{vuln.title}</h3><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{vuln.description}</p></div>
                              </div>
                              <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0 shrink-0">{vuln.severity}</Badge>
                            </div>
                            {vuln.source && <div className="flex items-center gap-1 ml-4 mb-2"><span className="text-[10px] text-muted-foreground">Detected by:</span>{vuln.source.split(', ').map((src) => <Badge key={src} variant="outline" className="text-[9px] px-1 py-0 h-4">{src}</Badge>)}</div>}
                            <div className="ml-4 mt-2 p-3 rounded border bg-muted/10">
                              <div className="flex items-start gap-2"><Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" /><div><span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendation</span><p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{vuln.recommendation}</p></div></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader className="border-b"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Export Report</CardTitle></CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs text-muted-foreground">Download:</span>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-none" onClick={() => downloadReport('html')}><FileText className="h-3.5 w-3.5" /> HTML</Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-none" onClick={() => downloadReport('md')}><FileText className="h-3.5 w-3.5" /> Markdown</Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-none" onClick={downloadPdf}><FileText className="h-3.5 w-3.5" /> PDF</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card><CardContent className="py-12 text-center"><CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" /><h3 className="text-sm font-medium">No vulnerabilities found</h3><p className="text-xs text-muted-foreground mt-1">Your website passed all security checks.</p></CardContent></Card>
          )}
        </div>
      )}

      {view === 'ai' && (
        <>
          {isPremium ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="border-b bg-muted/10"><div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs font-semibold text-muted-foreground">AI-Generated Security Summary</span></div></CardHeader>
                <CardContent className="pt-4">
                  {scan.ai_summary ? (
                    <div>
                      {scan.ai_summary.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) return <h3 key={i} className="text-base font-semibold mt-5 mb-2">{line.replace('## ', '')}</h3>
                        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-medium text-sm mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>
                        if (line.startsWith('- ')) return <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">{line.replace('- ', '')}</li>
                        if (line.match(/^\d\.\s/)) return <li key={i} className="text-sm text-muted-foreground ml-4 list-decimal">{line.replace(/^\d\.\s/, '')}</li>
                        if (line.trim() === '') return <br key={i} />
                        return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                      })}
                    </div>
                  ) : <div className="text-center py-8"><Brain className="h-8 w-8 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">AI analysis not available for this scan.</p></div>}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 sm:py-16 text-center">
                <LockKeyhole className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-base sm:text-lg font-semibold mb-1">Premium Feature</h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 px-4">
                  AI-powered detailed vulnerability analysis and smart recommendations are available exclusively for premium users.
                </p>
                <Button variant="outline" className="gap-1.5" disabled>
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
