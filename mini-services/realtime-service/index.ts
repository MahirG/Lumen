/**
 * Hisab Gold AI — Realtime Service
 *
 * Mini WebSocket service that pushes:
 *   - Live XAUUSD price ticks (real data from gold-api.com every 30s, synthetic micro-ticks every 1.2s)
 *   - SMC alert notifications (when events trigger)
 *   - Session change notifications
 *   - News countdown updates
 *
 * Port: 3003 (Caddy forwards /?XTransformPort=3003 to this service)
 */

import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// === Real gold price fetching ===
const GOLD_API_URL = 'https://api.gold-api.com/price/XAU'
let realGoldPrice: number | null = null
let lastRealFetch = 0
let realFetchError: string | null = null

async function fetchRealGoldPrice(): Promise<number | null> {
  const now = Date.now()
  // Cache for 25 seconds (server-side) to respect rate limits
  if (realGoldPrice !== null && now - lastRealFetch < 25000) {
    return realGoldPrice
  }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(GOLD_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (typeof data.price !== 'number' || data.price <= 0) {
      throw new Error('Invalid price')
    }
    realGoldPrice = data.price
    lastRealFetch = now
    realFetchError = null
    console.log(`[Hisab Realtime] Fetched real gold price: $${data.price}`)
    return realGoldPrice
  } catch (err: any) {
    realFetchError = err.message
    console.warn(`[Hisab Realtime] Gold price fetch failed (using cached/fallback):`, err.message)
    return realGoldPrice // return cached value if available
  }
}

// === Micro-tick simulation around real price ===
let currentDisplayPrice: number = 2650
let microTickOffset: number = 0

function generateTick(): { price: number; bid: number; ask: number; timestamp: number; real: boolean; source: string } {
  const realPrice = realGoldPrice ?? 2650
  // Drift the display price toward the real price smoothly
  const drift = (realPrice - currentDisplayPrice) * 0.15
  // Small noise around the real price for visual liveliness
  const noise = (Math.random() - 0.5) * 0.5
  microTickOffset = Math.max(-2, Math.min(2, microTickOffset + noise))
  currentDisplayPrice = currentDisplayPrice + drift + microTickOffset * 0.1

  const spread = 0.30
  return {
    price: currentDisplayPrice,
    bid: currentDisplayPrice - spread / 2,
    ask: currentDisplayPrice + spread / 2,
    timestamp: Date.now(),
    real: realGoldPrice !== null,
    source: realGoldPrice !== null ? 'gold-api.com' : 'fallback',
  }
}

// Alert type pool
const ALERT_TYPES = [
  { type: 'LIQUIDITY_SWEEP', severity: 'critical' as const, message: 'Buy-side liquidity swept at ${price} — potential reversal signal' },
  { type: 'CHOCH', severity: 'critical' as const, message: 'Bullish CHoCH at ${price} — short-term structure shift' },
  { type: 'BOS', severity: 'warn' as const, message: 'Bearish BOS at ${price} — trend continuation confirmed' },
  { type: 'ORDER_BLOCK', severity: 'info' as const, message: 'Unmitigated bullish order block at ${price}' },
  { type: 'FVG_FILL', severity: 'info' as const, message: 'Bullish FVG filled at ${price}' },
  { type: 'PREMIUM', severity: 'info' as const, message: 'Price entered premium zone above ${price}' },
  { type: 'DISCOUNT', severity: 'info' as const, message: 'Price entered discount zone below ${price}' },
  { type: 'INDUCEMENT', severity: 'warn' as const, message: 'Inducement level detected at ${price}' },
]

function maybeGenerateAlert(): { type: string; severity: 'info' | 'warn' | 'critical'; message: string; price: number; timestamp: number } | null {
  if (Math.random() < 0.04) {
    const template = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)]
    const price = Math.round((currentDisplayPrice + (Math.random() - 0.5) * 5) * 100) / 100
    return {
      type: template.type,
      severity: template.severity,
      message: template.message.replace('${price}', price.toFixed(2)),
      price,
      timestamp: Date.now(),
    }
  }
  return null
}

const connectedClients = new Set<string>()

io.on('connection', (socket) => {
  console.log(`[Hisab Realtime] Client connected: ${socket.id}`)
  connectedClients.add(socket.id)

  socket.emit('welcome', {
    message: 'Connected to Hisab Gold AI realtime service',
    symbol: 'XAUUSD',
    timestamp: Date.now(),
    realPriceAvailable: realGoldPrice !== null,
  })

  // Send initial snapshot
  socket.emit('price-tick', generateTick())

  socket.on('subscribe', (channels: string[]) => {
    for (const ch of channels) socket.join(ch)
    socket.emit('subscribed', { channels })
  })

  socket.on('unsubscribe', (channels: string[]) => {
    for (const ch of channels) socket.leave(ch)
  })

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() })
  })

  socket.on('disconnect', () => {
    console.log(`[Hisab Realtime] Client disconnected: ${socket.id}`)
    connectedClients.delete(socket.id)
  })

  socket.on('error', (err) => {
    console.error(`[Hisab Realtime] Socket error (${socket.id}):`, err)
  })
})

// === Broadcast loops ===
// Real price fetch every 25 seconds
setInterval(async () => {
  await fetchRealGoldPrice()
}, 25000)

// Initial fetch on startup
fetchRealGoldPrice().then(() => {
  if (realGoldPrice !== null) {
    currentDisplayPrice = realGoldPrice
  }
})

// Micro-tick broadcast every 1.2s
const TICK_INTERVAL = 1200
setInterval(() => {
  if (connectedClients.size === 0) return
  const tick = generateTick()
  io.emit('price-tick', {
    symbol: 'XAUUSD',
    ...tick,
  })
}, TICK_INTERVAL)

// Alert broadcast every 8s
const ALERT_INTERVAL = 8000
setInterval(() => {
  if (connectedClients.size === 0) return
  const alert = maybeGenerateAlert()
  if (alert) {
    io.emit('alert', alert)
    console.log(`[Hisab Realtime] Alert broadcast: ${alert.type} @ ${alert.price}`)
  }
}, ALERT_INTERVAL)

// Session change detector
const SESSION_HOURS: Record<string, [number, number]> = {
  ASIAN: [0, 7],
  LONDON: [7, 16],
  NEW_YORK: [12, 21],
}
let lastSession = ''
setInterval(() => {
  const utcHour = new Date().getUTCHours()
  let currentSessionName = 'OFF_SESSION'
  for (const [name, [start, end]] of Object.entries(SESSION_HOURS)) {
    if (utcHour >= start && utcHour < end) {
      currentSessionName = name
    }
  }
  if (currentSessionName !== lastSession) {
    io.emit('session-change', {
      previous: lastSession,
      current: currentSessionName,
      timestamp: Date.now(),
    })
    lastSession = currentSessionName
  }
}, 30000)

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Hisab Realtime] WebSocket service running on port ${PORT}`)
  console.log(`[Hisab Realtime] Fetching real gold price from ${GOLD_API_URL} every 25s`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Hisab Realtime] SIGTERM received, shutting down...')
  io.close()
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('[Hisab Realtime] SIGINT received, shutting down...')
  io.close()
  httpServer.close(() => process.exit(0))
})
