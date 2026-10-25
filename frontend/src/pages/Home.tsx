import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Search, Radar, Bot, FileText, ArrowRight, CheckCircle, Zap, Sparkles, ScrollText, Gauge, Network, Bug } from 'lucide-react'


function HeroVisual() {
  const [revealed, setRevealed] = useState(false)
  const [cursor, setCursor] = useState(true)
  const [line, setLine] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!revealed) return
    const i = setInterval(() => setLine((p) => Math.min(p + 1, 12)), 320)
    return () => clearInterval(i)
  }, [revealed])

  useEffect(() => {
    const c = setInterval(() => setCursor((p) => !p), 530)
    return () => clearInterval(c)
  }, [])

  const LINES = [
    { prefix: '$', text: 'sanrakshak scan --target <website>', style: 'text-white font-semibold' },
    { type: 'blank' as const },
    { prefix: '>', text: 'initializing security assessment engine...', style: 'text-white/70' },
    { prefix: '>', text: 'running Nmap — port & service discovery', style: 'text-white/70' },
    { prefix: '>', text: 'running Nikto — web server vulnerability scan', style: 'text-white/70' },
    { prefix: '>', text: 'running OWASP ZAP — web app security testing', style: 'text-white/70' },
    { type: 'blank' as const },
    { prefix: '>', text: 'analyzing results with Gemini AI...', style: 'text-white/70' },
    { type: 'blank' as const },
    { prefix: '', text: '# scan complete — report ready', style: 'text-[10px] font-semibold text-white/50 uppercase tracking-widest' as const },
    { prefix: '•', text: 'security score calculated', style: 'text-white/80' as const },
    { prefix: '•', text: 'vulnerabilities identified & classified', style: 'text-white/80' as const },
    { prefix: '•', text: 'AI summary generated', style: 'text-white/80' as const },
  ] as const

  const visible = LINES.slice(0, Math.min(line + 1, LINES.length))

  return (
    <div className="rounded-xl border border-white/10 bg-black overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-px bg-white/5 animate-scan-line" />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[3%] bg-[#0a0a0a]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="text-[10px] text-white/30 ml-3 font-mono">sanrakshak — scan</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed min-h-[280px]">
        {visible.map((item, i) => {
          if ('type' in item && item.type === 'blank') return <div key={i} className="h-2" />
          if ('prefix' in item && 'text' in item && 'style' in item) {
            const isLast = i === visible.length - 1
            return (
              <div key={i} className="flex items-start gap-2">
                <span className="text-white/30 w-4 shrink-0 text-right">{item.prefix || ''}</span>
                <span className={item.style}>{item.text}{isLast && cursor ? <span className="w-1.5 h-3.5 bg-white/60 inline-block ml-0.5 align-text-bottom" /> : null}</span>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

const features = [
  { icon: Radar, title: 'Multi-Tool Scanning', description: 'Nmap, Nikto, and OWASP ZAP run in parallel for a comprehensive security assessment.' },
  { icon: Bot, title: 'AI-Powered Analysis', description: 'Gemini AI translates raw findings into clear explanations and actionable fixes.' },
  { icon: Gauge, title: 'Security Scoring', description: 'Get an overall score with severity breakdowns to prioritize what matters most.' },
  { icon: FileText, title: 'Exportable Reports', description: 'Download professional reports in HTML, Markdown, or PDF format.' },
]

const steps = [
  { number: '01', title: 'Enter URL', description: 'Type or paste the website URL you want to assess.', icon: Search },
  { number: '02', title: 'Automated Scanning', description: 'Nmap, Nikto, and OWASP ZAP scan for ports, vulnerabilities, and misconfigurations.', icon: Radar },
  { number: '03', title: 'AI Analysis', description: 'Gemini AI converts technical findings into clear explanations and recommendations.', icon: Sparkles },
  { number: '04', title: 'Review & Report', description: 'View the combined report, AI summary, and download professional reports.', icon: ScrollText },
]

const tools = [
  { name: 'Nmap', role: 'Port & Service Discovery' },
  { name: 'Nikto', role: 'Server Vulnerability Scanner' },
  { name: 'OWASP ZAP', role: 'Web Application Security Testing' },
  { name: 'Gemini AI', role: 'Report Generation & Analysis' },
]

export default function Home() {
  const navigate = useNavigate()

  const startScanning = () => {
    navigate('/scan/new')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight">
            <div className="p-1.5 rounded-lg border"><Shield className="h-3.5 w-3.5" /></div>
            Sanrakshak
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-xs">Sign In</Button>
            <Button size="sm" onClick={startScanning} className="text-xs h-8">Get Started</Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 md:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] text-muted-foreground bg-muted/5">
                <Sparkles className="h-3 w-3" />
                AI-Powered Security Assessment
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.1]">
                  <span className="text-foreground">Protect.</span>{' '}
                  <span className="text-muted-foreground">Analyze.</span>{' '}
                  <span className="text-foreground">Secure.</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                  Automated vulnerability assessments and AI-generated security reports in simple, understandable language. No security expertise required.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-3 pt-1">
                <Button className="gap-2 h-10 px-5 text-sm" onClick={startScanning}>
                  <Zap className="h-4 w-4" />
                  Start Scanning Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="gap-2 h-10 px-5 text-sm" onClick={startScanning}>
                  <Shield className="h-4 w-4" />
                  Try Demo Scan
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-foreground/40" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-foreground/40" /> Free to start</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-foreground/40" /> AI-powered</span>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,hsl(var(--foreground)/0.04),transparent_60%)] rounded-3xl" />
              <div className="absolute top-1/4 -left-2 w-24 h-24 rounded-full border border-foreground/[0.02]" />
              <div className="absolute bottom-1/4 -right-2 w-32 h-32 rounded-full border border-foreground/[0.02]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-foreground/[0.01]" />
              <div className="relative">
                <HeroVisual />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/5">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {tools.map((tool) => {
                const icons: Record<string, React.ElementType> = { Nmap: Network, Nikto: Bug, 'OWASP ZAP': Shield, 'Gemini AI': Sparkles }
                const Icon = icons[tool.name] || Shield
                return (
                  <div key={tool.name} className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3.5">
                    <div className="p-1.5 rounded-lg border bg-muted/5"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{tool.name}</p>
                      <p className="text-[10px] text-muted-foreground/60 truncate">{tool.role}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
          <div className="text-center mb-14 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">Four simple steps to understand your website's security posture</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-border" />
            <div className="grid md:grid-cols-4 gap-5 md:gap-6">
              {steps.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="relative flex md:block">
                    <div className="hidden lg:flex absolute top-0 left-0 right-0 justify-center z-10">
                      <span className="w-7 h-7 rounded-full border-2 bg-background flex items-center justify-center text-[11px] font-bold">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex md:block items-start gap-4 md:gap-0">
                      <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full border-2 text-[11px] font-bold shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</div>
                      <Card className="h-full border-muted/30 flex-1">
                        <CardHeader className="pb-2">
                          <div className="p-2 rounded-lg border w-fit mb-2 bg-muted/5"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                          <CardTitle className="text-sm">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground/70 leading-relaxed">{step.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/5">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
            <div className="text-center mb-14 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Everything You Need</h2>
              <p className="text-muted-foreground mt-3 text-sm">Comprehensive security assessment tools in one platform</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="border-muted/30 hover:bg-muted/10 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="p-2 rounded-lg border w-fit mb-2 bg-background"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                      <CardTitle className="text-sm">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground/70 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-3 rounded-xl border w-fit mx-auto bg-muted/5"><Shield className="h-8 w-8 text-muted-foreground" /></div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Ready to Secure Your Website?</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                Start your first security scan in seconds. No configuration needed — just enter a URL and get results.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button className="gap-2 h-10 px-6 text-sm" onClick={startScanning}>
                <Zap className="h-4 w-4" />
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2 h-10 px-6 text-sm" onClick={startScanning}>
                View Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <div className="p-1 rounded border"><Shield className="h-3 w-3" /></div>
            <span className="font-medium">Sanrakshak</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
            <span>Protect. Analyze. Secure.</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
