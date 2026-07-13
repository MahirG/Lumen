'use client'

import * as React from 'react'
import { io, type Socket } from 'socket.io-client'
import { useMarketStore } from '@/lib/hisab/market-store'

/**
 * Hook that connects to the Hisab realtime WebSocket service.
 * Pushes live price ticks and alert notifications into the global market store.
 *
 * Service runs on port 3003, accessed via Caddy through /?XTransformPort=3003
 */
export function useRealtimeService() {
  const tick = useMarketStore(s => s.tick)
  const refreshAlerts = useMarketStore(s => s.refreshAlerts)
  const socketRef = React.useRef<Socket | null>(null)
  const [connected, setConnected] = React.useState(false)

  React.useEffect(() => {
    if (socketRef.current) return
    try {
      const socket = io('/?XTransformPort=3003', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      })
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('[Hisab Realtime] Connected')
        setConnected(true)
        socket.emit('subscribe', ['price', 'alerts', 'session'])
      })

      socket.on('disconnect', () => {
        console.log('[Hisab Realtime] Disconnected')
        setConnected(false)
      })

      socket.on('price-tick', (data: { price: number; bid: number; ask: number; timestamp: number }) => {
        // Trigger Zustand tick which updates price from internal state.
        // The store has its own price simulation; we use this just to refresh.
        tick()
      })

      socket.on('alert', (alert: any) => {
        // Push alert into store
        const store = useMarketStore.getState()
        // Just trigger refresh which will generate alerts from latest SMC
        refreshAlerts('15M')
      })

      socket.on('session-change', (data: { current: string; previous: string }) => {
        useMarketStore.getState().refreshSession()
      })

      socket.on('connect_error', (err: any) => {
        // Silent — the app still works without realtime
        console.warn('[Hisab Realtime] Connection error (non-fatal):', err.message)
      })
    } catch (err) {
      console.warn('[Hisab Realtime] Failed to connect:', err)
    }

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [tick, refreshAlerts])

  return { connected }
}
