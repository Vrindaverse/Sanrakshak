import { useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'

type PortState = 'open' | 'filtered' | 'closed'

interface PortEntry {
  port: number
  service: string
  state: PortState
}

const SERVICES: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'TELNET',
  25: 'SMTP',
  53: 'DNS',
  67: 'DHCP',
  69: 'TFTP',
  80: 'HTTP',
  110: 'POP3',
  111: 'RPC',
  119: 'NNTP',
  123: 'NTP',
  135: 'MS RPC',
  137: 'NETBIOS',
  139: 'NETBIOS',
  143: 'IMAP',
  161: 'SNMP',
  179: 'BGP',
  389: 'LDAP',
  443: 'HTTPS',
  445: 'SMB',
  465: 'SMTPS',
  500: 'IKE',
  514: 'SYSLOG',
  587: 'SMTP',
  636: 'LDAPS',
  873: 'RSYNC',
  993: 'IMAPS',
  995: 'POP3S',
  1080: 'SOCKS',
  1433: 'MSSQL',
  1521: 'ORACLE',
  2049: 'NFS',
  3000: 'DEV',
  3306: 'MYSQL',
  3389: 'RDP',
  5432: 'POSTGRES',
  5900: 'VNC',
  6379: 'REDIS',
  8000: 'HTTP-ALT',
  8080: 'HTTP-PROXY',
  8443: 'HTTPS-ALT',
  8888: 'HTTP',
  9000: 'APP',
  9200: 'ELASTIC',
  27017: 'MONGO',
}

const OPEN = new Set([22, 80, 443, 8080])
const FILTERED = new Set([21, 25, 3306, 3389, 9200])

const PORTS: PortEntry[] = Object.keys(SERVICES)
  .map(Number)
  .sort((a, b) => a - b)
  .map((port) => ({
    port,
    service: SERVICES[port],
    state: OPEN.has(port) ? 'open' : FILTERED.has(port) ? 'filtered' : 'closed',
  }))

export function PortGrid() {
  const [active, setActive] = useState<PortEntry>(PORTS.find((entry) => entry.port === 443) ?? PORTS[0])
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '-10%' })

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/25 p-3">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-scan-line h-px w-full bg-acid/20" />
        </div>
        <div
          ref={gridRef}
          data-ready={inView ? 'true' : 'false'}
          className="port-grid relative grid grid-cols-12 gap-1.5"
          aria-hidden="true"
        >
          {PORTS.map((entry, index) => (
            <div
              key={entry.port}
              data-state={entry.state}
              data-active={active.port === entry.port}
              className="port-cell"
              style={{ '--i': index } as CSSProperties}
              onPointerEnter={() => setActive(entry)}
              onClick={() => setActive(entry)}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                active.state === 'open'
                  ? 'var(--acid)'
                  : active.state === 'filtered'
                    ? 'var(--warning)'
                    : 'oklch(1 0 0 / 0.24)',
              boxShadow: active.state === 'open' ? '0 0 10px oklch(0.9 0.18 130 / 0.7)' : 'none',
            }}
          />
          <span className="type-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Port {active.port} / {active.service} /{' '}
            <span className={active.state === 'open' ? 'text-acid' : active.state === 'filtered' ? 'text-warning' : 'text-muted-foreground'}>
              {active.state}
            </span>
          </span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="type-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground/70">
            <span className="mr-1 inline-block h-1 w-1 bg-acid" /> open
          </span>
          <span className="type-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground/70">
            <span className="mr-1 inline-block h-1 w-1 bg-warning/70" /> filtered
          </span>
        </div>
      </div>
      <p className="sr-only">
        Illustrative port map. Open ports include SSH, HTTP, HTTPS and an alternate web proxy. Hover a port to inspect its service and state.
      </p>
    </div>
  )
}
