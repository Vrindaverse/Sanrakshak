import { useRef, useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  FileText,
  Gauge,
  Radar,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react'
import { ChromeCore } from '@/components/landing/ChromeCore'
import { ChromeCursor } from '@/components/landing/ChromeCursor'
import { Counter } from '@/components/landing/Counter'
import { MagneticButton, MagneticLink } from '@/components/landing/MagneticButton'
import { PortGrid } from '@/components/landing/PortGrid'
import { Preloader, shouldPlayIntro } from '@/components/landing/Preloader'
import { Reveal, Stagger } from '@/components/landing/Reveal'
import { ScanConsole } from '@/components/landing/ScanConsole'
import { ScrollProgress } from '@/components/landing/ScrollProgress'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { TiltCard } from '@/components/landing/TiltCard'
import { ThreatGlobe } from '@/components/landing/ThreatGlobe'
import { VelocityMarquee } from '@/components/landing/VelocityMarquee'
import { Wordmark } from '@/components/landing/BrandMark'
import { EASE_OUT_EXPO, EASE_OUT_SOFT, revealItem, staggerContainer } from '@/lib/motion'

const heroContainer = staggerContainer(0.09, 0.1)

const heroItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(5px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: EASE_OUT_SOFT },
  },
}

const heroLine = {
  hidden: { opacity: 0, y: '108%' },
  show: {
    opacity: 1,
    y: '0%',
    transition: { duration: 1.1, ease: EASE_OUT_EXPO },
  },
}

const heroMetrics = [
  { to: 3, label: 'scan engines' },
  { to: 1, label: 'AI analyst' },
  { to: 0, label: 'setup required' },
]

const triage = [
  { label: 'Critical', count: 1, width: '14%', tone: 'bg-destructive' },
  { label: 'High', count: 2, width: '28%', tone: 'bg-warning' },
  { label: 'Medium', count: 3, width: '42%', tone: 'bg-ice' },
  { label: 'Low', count: 4, width: '16%', tone: 'bg-white/25' },
]

const headers = [
  { name: 'Strict-Transport-Security', present: false },
  { name: 'Content-Security-Policy', present: false },
  { name: 'X-Content-Type-Options', present: true },
  { name: 'X-Frame-Options', present: false },
]

const steps = [
  {
    title: 'Point it at a URL',
    body: 'No agents, no configuration files, no onboarding call. Paste the address you want to understand.',
    meta: 'zero setup',
  },
  {
    title: 'Three engines go to work',
    body: 'Nmap maps ports and services. Nikto checks server configuration. OWASP ZAP probes the application surface.',
    meta: 'nmap · nikto · zap',
  },
  {
    title: 'Gemini translates the noise',
    body: 'Raw findings become a severity-ordered explanation you can read without a security background.',
    meta: 'plain language',
  },
  {
    title: 'Read it, fix it, share it',
    body: 'Review the report, act on the recommendation, then export it in the format your audience needs.',
    meta: 'pdf · html · markdown',
  },
]

const principles = [
  {
    icon: BookOpen,
    title: 'Plain language first',
    body: 'If a finding needs a glossary, it is not finished. Every explanation is written for the person who has to fix it.',
  },
  {
    icon: AlertTriangle,
    title: 'Severity over volume',
    body: 'Fix the one critical thing before the fifty cosmetic ones. Findings are ordered by what can actually hurt you.',
  },
  {
    icon: Share2,
    title: 'Proof you can share',
    body: 'Export a professional report a client, teammate or lecturer can open, read and act on without extra context.',
  },
]

const signalItems = ['Protect', 'Analyze', 'Secure', 'See the unseen', 'Signal over noise']

function SectionHeading({
  index,
  label,
  children,
}: {
  index: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="eyebrow">
        <span className="eyebrow-line" />
        {index} / {label}
      </p>
      <h2 className="type-display mt-5 max-w-4xl text-balance text-[clamp(2.7rem,5.6vw,5.2rem)] leading-[0.94] tracking-[-0.03em]">
        {children}
      </h2>
    </div>
  )
}

function CardKicker({
  index,
  label,
  icon: Icon,
}: {
  index: string
  label: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="type-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/70">
        {index} / {label}
      </span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-acid/80">
        <Icon className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}

function ScoreRing() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const radius = 41
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - 0.74)

  return (
    <div ref={ref} className="relative h-24 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--acid)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: offset } : undefined}
          transition={{ duration: 1.3, ease: EASE_OUT_EXPO }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="type-mono text-2xl text-foreground">
          <Counter to={74} pad={2} duration={1300} />
        </span>
        <span className="type-mono text-[0.5rem] uppercase tracking-[0.18em] text-muted-foreground/70">example</span>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [introDone, setIntroDone] = useState(() => !shouldPlayIntro())

  return (
    <div id="top" className="site-page">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Preloader onExitStart={() => setIntroDone(true)} />
      <ChromeCursor />
      <ScrollProgress />
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="relative z-10">
        <section className="relative min-h-[100svh] overflow-hidden pt-24 md:pt-28">
          <div className="hero-aurora" />
          <div className="absolute inset-0 grid-lines opacity-60" />
          <div className="section-shell relative grid min-h-[calc(100svh-6rem)] items-center gap-8 pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-2">
            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate={introDone ? 'show' : 'hidden'}
              className="relative z-10 max-w-2xl"
            >
              <motion.p variants={heroItem} className="eyebrow">
                <span className="status-dot" />
                AI-native security assessment
              </motion.p>

              <motion.h1
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                className="type-display mt-6 text-[clamp(3.5rem,8.4vw,7.5rem)] leading-[0.86] tracking-[-0.035em]"
              >
                <span className="-mb-[0.06em] block overflow-hidden pb-[0.06em]">
                  <motion.span variants={heroLine} className="block">See what</motion.span>
                </span>
                <span className="-mb-[0.06em] block overflow-hidden pb-[0.06em]">
                  <motion.span variants={heroLine} className="block">
                    <em className="chrome-text">attackers</em> see.
                  </motion.span>
                </span>
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mt-7 max-w-lg text-[0.98rem] leading-relaxed text-muted-foreground sm:text-[1.05rem]"
              >
                Sanrakshak maps your attack surface with Nmap, Nikto and OWASP ZAP,
                then turns the noise into a clear, AI-written security report.
              </motion.p>

              <motion.div variants={heroItem} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <MagneticLink href="#start">
                  Run a free scan
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticLink>
                <MagneticLink href="#process" variant="ghost">
                  Watch it work
                  <ArrowDown className="h-4 w-4" />
                </MagneticLink>
              </motion.div>

              <motion.div
                variants={heroItem}
                className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.08] pt-5"
              >
                {heroMetrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="type-mono text-2xl text-foreground sm:text-3xl">
                      <Counter to={metric.to} />
                    </p>
                    <p className="type-mono mt-1 text-[0.55rem] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground/70">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={introDone ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.1 }}
              className="relative order-first h-[380px] sm:h-[500px] lg:order-last lg:h-[640px]"
            >
              <ChromeCore />

              <div className="glass-panel chrome-border pointer-events-none absolute left-0 top-5 rounded-xl px-3.5 py-2.5 sm:left-2">
                <p className="type-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted-foreground/70">Perimeter</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="status-dot" />
                  <span className="type-mono text-[0.62rem] uppercase tracking-[0.14em] text-foreground/90">Live surface</span>
                </div>
              </div>

              <div className="glass-panel chrome-border pointer-events-none absolute right-0 top-16 rounded-xl px-3.5 py-2.5 sm:right-2">
                <p className="type-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted-foreground/70">Scan engines</p>
                <p className="type-mono mt-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-ice">03 / online</p>
              </div>

              <div className="glass-panel chrome-border pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full px-4 py-2">
                <p className="type-mono whitespace-nowrap text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="mr-2 inline-block h-1 w-1 rounded-full bg-acid align-middle" />
                  AI verdict / plain English
                </p>
              </div>
            </motion.div>
          </div>

          <div className="section-shell relative flex items-center gap-5 pb-8">
            <span className="type-mono whitespace-nowrap text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground/75">
              Scroll to inspect
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            <ArrowDown
              className="h-3.5 w-3.5 text-muted-foreground/75"
              style={{ animation: 'float-soft 2.4s ease-in-out infinite' }}
            />
          </div>
        </section>

        <VelocityMarquee items={signalItems} />

        <section id="surface" className="section-pad relative scroll-mt-24 overflow-hidden border-t border-white/[0.06]">
          <div className="section-shell">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
              <Reveal>
                <SectionHeading index="05" label="Surface">
                  Your attack surface, <em className="chrome-text">in orbit.</em>
                </SectionHeading>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Drag or use the arrow keys to rotate. Every point is a live finding.
                  The globe is the map attackers use.
                </p>
              </Reveal>
              <div className="relative h-[420px] sm:h-[520px]">
                <ThreatGlobe className="h-full w-full" />
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="section-pad relative scroll-mt-24">
          <div className="section-shell">
            <Reveal>
              <SectionHeading index="02" label="Capabilities">
                One scan. <em className="chrome-text">Four layers of truth.</em>
              </SectionHeading>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Most tools stop at a wall of output. Sanrakshak connects the surface,
                the weakness, the explanation and the fix.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 lg:grid-cols-12">
              <TiltCard className="p-6 sm:p-7 lg:col-span-7 lg:row-span-2">
                <div className="flex h-full flex-col">
                  <CardKicker index="01" label="Recon" icon={Radar} />
                  <h3 className="type-display mt-6 text-3xl leading-none tracking-[-0.02em] sm:text-4xl">
                    Port &amp; service map
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Every door your site leaves open, mapped before someone else finds it.
                    Hover the grid to inspect a service.
                  </p>
                  <div className="mt-auto pt-7">
                    <PortGrid />
                  </div>
                </div>
              </TiltCard>

              <TiltCard className="p-6 lg:col-span-5">
                <CardKicker index="02" label="Triage" icon={AlertTriangle} />
                <h3 className="type-display mt-5 text-2xl leading-none tracking-[-0.02em] sm:text-3xl">
                  Severity, not noise
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Findings ordered by what can actually hurt you.
                </p>
                <div className="mt-6 space-y-3">
                  {triage.map((item) => (
                    <div key={item.label} className="grid grid-cols-[4.2rem_1fr_1.4rem] items-center gap-3">
                      <span className="type-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground/75">
                        {item.label}
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          className={`h-full rounded-full ${item.tone}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: item.width }}
                          viewport={{ once: true, margin: '-10%' }}
                          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        />
                      </div>
                      <span className="type-mono text-right text-[0.62rem] text-foreground/70">{item.count}</span>
                    </div>
                  ))}
                </div>
                <p className="type-mono mt-5 border-t border-white/[0.06] pt-3 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground/75">
                  Weighted by exploitability
                </p>
              </TiltCard>

              <TiltCard className="p-6 lg:col-span-5">
                <CardKicker index="03" label="Hardening" icon={ShieldCheck} />
                <h3 className="type-display mt-5 text-2xl leading-none tracking-[-0.02em] sm:text-3xl">
                  Header hygiene
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  The quiet misconfigurations that widen your blast radius.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {headers.map((header) => (
                    <li key={header.name} className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-2 last:border-0 last:pb-0">
                      <span className="truncate font-mono text-[0.62rem] text-muted-foreground/80">{header.name}</span>
                      <span
                        className={
                          header.present
                            ? 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-acid/10 text-acid'
                            : 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
                        }
                      >
                        {header.present ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                    </li>
                  ))}
                </ul>
              </TiltCard>

              <TiltCard className="p-6 lg:col-span-4">
                <CardKicker index="04" label="Translation" icon={Bot} />
                <h3 className="type-display mt-5 text-2xl leading-none tracking-[-0.02em]">
                  Findings in English
                </h3>
                <div className="mt-5 space-y-3">
                  <p className="font-mono text-[0.62rem] leading-relaxed text-muted-foreground/75 line-through decoration-destructive/60">
                    Content-Security-Policy header not set
                  </p>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    &ldquo;Your site lets scripts load from anywhere. One bad ad is enough.&rdquo;
                  </p>
                  <p className="type-mono text-[0.55rem] uppercase tracking-[0.16em] text-acid/70">Gemini analysis</p>
                </div>
              </TiltCard>

              <TiltCard className="p-6 lg:col-span-4">
                <CardKicker index="05" label="Output" icon={FileText} />
                <h3 className="type-display mt-5 text-2xl leading-none tracking-[-0.02em]">
                  Reports that travel
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Hand a client, teammate or lecturer something readable.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['PDF', 'HTML', 'Markdown'].map((format) => (
                    <span
                      key={format}
                      className="type-mono rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <div className="mt-5 h-px w-full bg-gradient-to-r from-acid/40 via-white/10 to-transparent" />
              </TiltCard>

              <TiltCard className="p-6 lg:col-span-4">
                <CardKicker index="06" label="Signal" icon={Gauge} />
                <div className="mt-5 flex items-center gap-5">
                  <ScoreRing />
                  <div>
                    <h3 className="type-display text-2xl leading-none tracking-[-0.02em]">One number</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      A severity-weighted score, so progress is visible.
                    </p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        <section id="process" className="section-pad relative scroll-mt-24 border-t border-white/[0.06]">
          <div className="section-shell">
            <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
              <div>
                <Reveal>
                  <SectionHeading index="03" label="Process">
                    From URL to verdict in <em className="chrome-text">four moves.</em>
                  </SectionHeading>
                  <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                    The scan runs in the background. The report is written for a human.
                    Nothing to install, nothing to decode.
                  </p>
                </Reveal>

                <div className="mt-10">
                  {steps.map((step, index) => (
                    <Reveal key={step.title} delay={index * 0.05}>
                      <div className="group grid grid-cols-[2rem_1fr] gap-4 border-t border-white/[0.08] py-6 transition-colors hover:border-white/20 sm:gap-6">
                        <span className="type-mono pt-1 text-[0.62rem] text-acid/70">0{index + 1}</span>
                        <div>
                          <h3 className="text-lg font-medium tracking-[-0.01em] text-foreground/90 transition-colors group-hover:text-foreground sm:text-xl">
                            {step.title}
                          </h3>
                          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {step.body}
                          </p>
                          <p className="type-mono mt-3 text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground/75">
                            {step.meta}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="lg:sticky lg:top-28 lg:self-start">
                <Reveal delay={0.1}>
                  <ScanConsole />
                </Reveal>
                <p className="type-mono mt-3 text-center text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground/75">
                  Illustrative session. Your report is generated from your target.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="section-pad relative scroll-mt-24 border-y border-white/[0.06] bg-[oklch(0.1_0.01_250_/_0.55)]">
          <div className="section-shell">
            <Reveal>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                04 / The point
              </p>
              <h2 className="type-display mt-6 max-w-4xl text-balance text-[clamp(2.7rem,6vw,5.6rem)] leading-[0.92] tracking-[-0.03em]">
                &ldquo;A vulnerability you can&apos;t <em className="chrome-text">understand</em> is one you won&apos;t fix.&rdquo;
              </h2>
            </Reveal>

            <Stagger className="mt-14 grid gap-4 md:grid-cols-3" delay={0.1}>
              {principles.map((principle) => (
                <motion.div key={principle.title} variants={revealItem} className="h-full">
                  <div className="chrome-border h-full rounded-2xl bg-white/[0.02] p-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-acid/80">
                      <principle.icon className="h-4 w-4" />
                    </span>
                    <h3 className="type-display mt-6 text-2xl leading-none tracking-[-0.02em]">{principle.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
                  </div>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        <section id="start" className="section-pad relative scroll-mt-24 overflow-hidden">
          <div className="chrome-halo" />
          <div className="chrome-orb pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] blur-3xl sm:h-[560px] sm:w-[560px]" />
          <div className="section-shell relative text-center">
            <Reveal>
              <p className="eyebrow justify-center">
                <span className="status-dot" />
                Ready when you are
              </p>
              <h2 className="type-display mx-auto mt-6 max-w-5xl text-balance text-[clamp(3.1rem,9.5vw,8.4rem)] leading-[0.84] tracking-[-0.04em]">
                Find your <em className="chrome-text">blind spots.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Point Sanrakshak at a URL and get a severity-ordered, plain-language
                picture of what is exposed.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MagneticButton onClick={() => navigate('/scan/new')} className="h-14 px-8 text-sm">
                  Run a free scan
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticLink href="#capabilities" variant="ghost" className="h-14 px-7 text-sm">
                  Explore capabilities
                </MagneticLink>
              </div>
              <p className="type-mono mt-6 text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground/75">
                Free to start · No credit card · No setup
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] bg-[oklch(0.085_0.008_250_/_0.8)]">
        <div className="section-shell py-14">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
            <div>
              <Wordmark />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Automated vulnerability assessment and AI-written security reports,
                built for people who are not security specialists.
              </p>
              <p className="type-mono mt-6 text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground/75">
                Protect. Analyze. Secure.
              </p>
            </div>
            <div>
              <p className="type-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground/75">Explore</p>
              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'Capabilities', href: '#capabilities' },
                  { label: 'Process', href: '#process' },
                  { label: 'Why it matters', href: '#why' },
                  { label: 'Start a scan', href: '#start' },
                ].map((link) => (
                  <a key={link.href} href={link.href} className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground lg:min-h-0 lg:py-0.5">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="type-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground/75">Engines</p>
              <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <p>Nmap</p>
                <p>Nikto</p>
                <p>OWASP ZAP</p>
                <p>Gemini</p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground/75">
              &copy; {new Date().getFullYear()} Sanrakshak
            </p>
            <p className="type-mono inline-flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground/75">
              <span className="status-dot" />
              Built for clarity
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
