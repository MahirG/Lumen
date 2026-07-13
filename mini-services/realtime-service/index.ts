/**
 * Hisab Gold AI — Realtime Service
 *
 * Mini WebSocket service that pushes:
 *   - Live XAUUSD price ticks (every 1.2s)
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

// === In-memory market simulation ===
const BASE_PRICE = 2650
let currentPrice = BASE_PRICE + (Math.random() - 0.5) * 30
let currentTrend = 0
const TREND_SHIFT_PROB = 0.02 // 2% chance per tick to shift trend

function liveTick(): { price: number; bid: number; ask: number; timestamp: number } {
  if (Math.random() < TREND_SHIFT_PROB) {
    currentTrend = (Math.random() - 0.5) * 0.6
  }
  const noise = (Math.random() - 0.5) * 0.8
  currentPrice = Math.max(2400, currentPrice + noise + currentTrend * 0.3)
  return {
    price: currentPrice,
    bid: currentPrice - 0.15,
    ask: currentPrice + 0.15,
    timestamp: Date.now(),
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
  if (Math.random() < 0.04) { // 4% chance per tick
    const template = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)]
    const price = Math.round((currentPrice + (Math.random() - 0.5) * 5) * 100) / 100
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
  })

  // Send initial snapshot
  socket.emit('price-tick', liveTick())

  socket.on('subscribe', (channels: string[]) => {
    for (const ch of channels) {
      socket.join(ch)
    }
    socket.emit('subscribed', { channels })
  })

  socket.on('unsubscribe', (channels: string[]) => {
    for (const ch of channels) {
      socket.leave(ch)
    }
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
const TICK_INTERVAL = 1200 // 1.2s
setInterval(() => {
  if (connectedClients.size === 0) return
  const tick = liveTick()
  io.emit('price-tick', {
    symbol: 'XAUUSD',
    ...tick,
  })
}, TICK_INTERVAL)

const ALERT_INTERVAL = 8000 // 8s
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
      // Pick the latest matching session (NY takes precedence over London if both active)
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
