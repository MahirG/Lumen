'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Zap, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CHART_COLORS,
  FIB_LEVELS,
  type SmartChartData,
  type SmartChartCandle,
} from '@/lib/hisab/ote-engine'

interface SmartChartProps {
  data: SmartChartData
  symbol?: string
  timeframe?: string
  className?: string
}

/**
 * SmartChartVisualization — AI-generated institutional analysis chart
 *
 * Renders all Smart Money Concepts components:
 * - Candlesticks with market price line
 * - Swing High/Low markers
 * - Internal (orange dashed) + External (blue solid) structure
 * - BOS (blue arrow) + MSS (purple arrow)
 * - Liquidity sweeps (yellow lightning)
 * - Equal Highs/Lows (yellow lines)
 * - Premium (red bg) / Discount (green bg) zones
 * - Fibonacci with 8 levels + OTE label
 * - Order Blocks (green/red rectangles, solid=fresh, semi-transparent=mitigated)
 * - Fair Value Gaps (light green/red boxes)
 * - Entry line (cyan), Stop Loss (red), TP1 (blue), TP2 (green)
 * - Active trade: glowing path + progress bar
 * - AI Analysis Panel beside chart
 */
export function SmartChartVisualization({ data, symbol = 'XAUUSD', timeframe = 'H1', className }: SmartChartProps) {
  const { candles, analysis } = data

  // Chart dimensions
  const W = 800
  const H = 400
  const padding = { top: 20, right: 120, bottom: 30, left: 10 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom

  // Price range from candles + fib + trade levels
  const allPrices = [
    ...candles.map(c => c.high),
    ...candles.map(c => c.low),
  ]
  if (data.fibonacci) {
    allPrices.push(data.fibonacci.swingHigh, data.fibonacci.swingLow)
  }
  if (data.trade) {
    allPrices.push(data.trade.entry, data.trade.stopLoss, data.trade.tp1, data.trade.tp2)
  }

  const maxPrice = Math.max(...allPrices)
  const minPrice = Math.min(...allPrices)
  const priceRange = maxPrice - minPrice || 1
  const paddedRange = priceRange * 1.1
  const paddedMin = minPrice - priceRange * 0.05

  // Helper: price to Y coordinate
  const priceToY = (price: number) => {
    return padding.top + chartH - ((price - paddedMin) / paddedRange) * chartH
  }

  // Helper: index to X coordinate
  const indexToX = (index: number) => {
    return padding.left + (index / Math.max(candles.length - 1, 1)) * chartW
  }

  // Candle width
  const candleW = Math.max(3, (chartW / candles.length) * 0.7)

  return (
    <div className={cn('w-full', className)}>
      {/* Chart header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg glass-gold flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-[#FFD700]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{symbol} · {timeframe}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Smart Chart · AI Institutional Analysis</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TradeStatusBadge status={analysis.tradeStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Chart area — 3 columns */}
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minHeight: 300 }}>
            {/* === Premium Zone (soft red background) === */}
            {data.premiumZone && (
              <rect
                x={padding.left}
                y={priceToY(data.premiumZone.top)}
                width={chartW}
                height={priceToY(data.premiumZone.bottom) - priceToY(data.premiumZone.top)}
                fill={CHART_COLORS.premiumZone}
              />
            )}

            {/* === Discount Zone (soft green background) === */}
            {data.discountZone && (
              <rect
                x={padding.left}
                y={priceToY(data.discountZone.top)}
                width={chartW}
                height={priceToY(data.discountZone.bottom) - priceToY(data.discountZone.top)}
                fill={CHART_COLORS.discountZone}
              />
            )}

            {/* === Grid lines === */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const y = padding.top + frac * chartH
              return (
                <line key={frac} x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
              )
            })}

            {/* === Equal Highs / Lows (yellow horizontal lines) === */}
            {data.swings.filter(s => s.type === 'high').length >= 2 && (
              <line
                x1={padding.left}
                y1={priceToY(data.swings.filter(s => s.type === 'high')[0].price)}
                x2={padding.left + chartW}
                y2={priceToY(data.swings.filter(s => s.type === 'high')[0].price)}
                stroke={CHART_COLORS.equalHighs}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            )}

            {/* === Fair Value Gaps === */}
            {data.fvgs.map((fvg, i) => {
              const x1 = indexToX(fvg.startIndex)
              const x2 = indexToX(fvg.endIndex)
              const y1 = priceToY(fvg.top)
              const y2 = priceToY(fvg.bottom)
              return (
                <g key={`fvg-${i}`}>
                  <rect
                    x={x1}
                    y={Math.min(y1, y2)}
                    width={Math.max(2, x2 - x1)}
                    height={Math.abs(y2 - y1)}
                    fill={fvg.type === 'bullish' ? CHART_COLORS.bullishFVG : CHART_COLORS.bearishFVG}
                    rx="2"
                  />
                  <text x={x1 + 4} y={Math.min(y1, y2) + 10} fill="var(--muted-foreground)" fontSize="8" fontFamily="monospace">FVG</text>
                </g>
              )
            })}

            {/* === Order Blocks === */}
            {data.orderBlocks.map((ob, i) => {
              const x1 = indexToX(ob.startIndex)
              const x2 = indexToX(ob.endIndex)
              const y1 = priceToY(ob.top)
              const y2 = priceToY(ob.bottom)
              const color = ob.type === 'bullish' ? CHART_COLORS.bullishOB : CHART_COLORS.bearishOB
              return (
                <rect
                  key={`ob-${i}`}
                  x={x1}
                  y={Math.min(y1, y2)}
                  width={Math.max(4, x2 - x1)}
                  height={Math.abs(y2 - y1)}
                  fill={color}
                  opacity={ob.mitigated ? 0.15 : 0.4}
                  rx="2"
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={ob.mitigated ? 0.3 : 0.6}
                />
              )
            })}

            {/* === Internal Structure (orange dashed) === */}
            {data.structures.filter(s => s.type === 'internal').map((s, i) => (
              <line
                key={`int-${i}`}
                x1={indexToX(s.fromIndex)}
                y1={priceToY(s.from)}
                x2={indexToX(s.toIndex)}
                y2={priceToY(s.to)}
                stroke={CHART_COLORS.internalStructure}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            ))}

            {/* === External Structure (blue solid) === */}
            {data.structures.filter(s => s.type === 'external').map((s, i) => (
              <line
                key={`ext-${i}`}
                x1={indexToX(s.fromIndex)}
                y1={priceToY(s.from)}
                x2={indexToX(s.toIndex)}
                y2={priceToY(s.to)}
                stroke={CHART_COLORS.externalStructure}
                strokeWidth="2"
                opacity="0.8"
              />
            ))}

            {/* === Candlesticks === */}
            {candles.map((c, i) => {
              const x = indexToX(i)
              const openY = priceToY(c.open)
              const closeY = priceToY(c.close)
              const highY = priceToY(c.high)
              const lowY = priceToY(c.low)
              const isUp = c.close >= c.open
              const color = isUp ? '#00E676' : '#FF5252'
              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" opacity="0.7" />
                  {/* Body */}
                  <rect
                    x={x - candleW / 2}
                    y={Math.min(openY, closeY)}
                    width={candleW}
                    height={Math.max(1, Math.abs(closeY - openY))}
                    fill={color}
                    opacity="0.85"
                    rx="0.5"
                  />
                </g>
              )
            })}

            {/* === Market Price Line (white) === */}
            {candles.length > 0 && (
              <line
                x1={padding.left}
                y1={priceToY(candles[candles.length - 1].close)}
                x2={padding.left + chartW}
                y2={priceToY(candles[candles.length - 1].close)}
                stroke={CHART_COLORS.marketPrice}
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.5"
              />
            )}

            {/* === Swing High (red circle) === */}
            {data.swings.filter(s => s.type === 'high').map((s, i) => (
              <g key={`sh-${i}`}>
                <circle cx={indexToX(s.index)} cy={priceToY(s.price)} r="4" fill={CHART_COLORS.swingHigh} stroke="#fff" strokeWidth="1" />
                <text x={indexToX(s.index) + 8} y={priceToY(s.price) - 6} fill={CHART_COLORS.swingHigh} fontSize="8" fontFamily="monospace" fontWeight="bold">Swing High</text>
              </g>
            ))}

            {/* === Swing Low (green circle) === */}
            {data.swings.filter(s => s.type === 'low').map((s, i) => (
              <g key={`sl-${i}`}>
                <circle cx={indexToX(s.index)} cy={priceToY(s.price)} r="4" fill={CHART_COLORS.swingLow} stroke="#fff" strokeWidth="1" />
                <text x={indexToX(s.index) + 8} y={priceToY(s.price) + 12} fill={CHART_COLORS.swingLow} fontSize="8" fontFamily="monospace" fontWeight="bold">Swing Low</text>
              </g>
            ))}

            {/* === BOS (blue arrow) === */}
            {data.bos.filter(b => b.type === 'BOS').map((b, i) => (
              <g key={`bos-${i}`}>
                <ArrowMarker x={indexToX(b.index)} y={priceToY(b.price)} direction={b.direction} color={CHART_COLORS.bos} label="BOS" />
              </g>
            ))}

            {/* === MSS (purple arrow) === */}
            {data.bos.filter(b => b.type === 'MSS').map((b, i) => (
              <g key={`mss-${i}`}>
                <ArrowMarker x={indexToX(b.index)} y={priceToY(b.price)} direction={b.direction} color={CHART_COLORS.mss} label="MSS" />
              </g>
            ))}

            {/* === Liquidity Sweep (yellow lightning) === */}
            {data.sweeps.map((sw, i) => (
              <g key={`sweep-${i}`}>
                <LightningIcon x={indexToX(sw.index)} y={priceToY(sw.price)} color={CHART_COLORS.liquiditySweep} />
              </g>
            ))}

            {/* === Fibonacci Levels === */}
            {data.fibonacci && (
              <FibonacciLevels
                fib={data.fibonacci}
                priceToY={priceToY}
                x1={padding.left}
                x2={padding.left + chartW}
              />
            )}

            {/* === Trade Levels (Entry, SL, TP1, TP2) === */}
            {data.trade && data.trade.status === 'READY' && (
              <TradeLevelLine y={priceToY(data.trade.entry)} x1={padding.left} x2={padding.left + chartW} color={CHART_COLORS.entry} label="ENTRY" />
            )}
            {data.trade && (
              <>
                <TradeLevelLine y={priceToY(data.trade.stopLoss)} x1={padding.left} x2={padding.left + chartW} color={CHART_COLORS.stopLoss} label="SL" />
                <TradeLevelLine y={priceToY(data.trade.tp1)} x1={padding.left} x2={padding.left + chartW} color={CHART_COLORS.tp1} label="TP1" />
                <TradeLevelLine y={priceToY(data.trade.tp2)} x1={padding.left} x2={padding.left + chartW} color={CHART_COLORS.tp2} label="TP2" />
              </>
            )}

            {/* === Active Trade Glowing Path === */}
            {data.trade && (data.trade.status === 'ACTIVE' || data.trade.status === 'TP1_HIT') && (
              <ActiveTradePath trade={data.trade} priceToY={priceToY} x={padding.left + chartW} />
            )}

            {/* === Price axis labels (right side) === */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const price = paddedMin + (1 - frac) * paddedRange
              const y = padding.top + frac * chartH
              return (
                <text key={`price-${frac}`} x={padding.left + chartW + 6} y={y + 3} fill="var(--muted-foreground)" fontSize="9" fontFamily="monospace">
                  {price.toFixed(2)}
                </text>
              )
            })}
          </svg>

          {/* Active Trade Progress Bar (below chart) */}
          {data.trade && (data.trade.status === 'ACTIVE' || data.trade.status === 'TP1_HIT') && (
            <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wide text-[#FFD700]">Trade Progress</span>
                <span className="text-[10px] font-mono font-bold text-foreground">{data.trade.progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.trade.progressPercent}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FFD700, #00E676)', boxShadow: '0 0 8px rgba(255, 215, 0, 0.5)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Panel — 1 column */}
        <div className="lg:col-span-1">
          <AIAnalysisPanel analysis={analysis} trade={data.trade} />
        </div>
      </div>

      {/* Trade Lifecycle + Fibonacci Level Ordering */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <TradeLifecycle status={analysis.tradeStatus} />
        <FibonacciOrdering fib={data.fibonacci} trade={data.trade} />
      </div>
    </div>
  )
}

/* ============================================
   ArrowMarker — BOS (blue) / MSS (purple)
   ============================================ */
function ArrowMarker({ x, y, direction, color, label }: { x: number; y: number; direction: 'up' | 'down'; color: string; label: string }) {
  const arrowSize = 8
  const offset = direction === 'up' ? -12 : 12
  return (
    <g>
      <path
        d={`M ${x} ${y + offset} L ${x - arrowSize / 2} ${y + offset + (direction === 'up' ? arrowSize : -arrowSize)} L ${x + arrowSize / 2} ${y + offset + (direction === 'up' ? arrowSize : -arrowSize)} Z`}
        fill={color}
      />
      <text x={x + 10} y={y + offset + 3} fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">{label}</text>
    </g>
  )
}

/* ============================================
   LightningIcon — Liquidity Sweep
   ============================================ */
function LightningIcon({ x, y, color }: { x: number; y: number; color: string }) {
  const size = 6
  return (
    <g>
      <path
        d={`M ${x} ${y - size} L ${x - size / 2} ${y} L ${x} ${y} L ${x} ${y + size} L ${x + size / 2} ${y} L ${x} ${y} Z`}
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      <text x={x + 8} y={y + 3} fill={color} fontSize="7" fontFamily="monospace" fontWeight="bold">Sweep</text>
    </g>
  )
}

/* ============================================
   FibonacciLevels — 8 levels with labels
   BUY:  Fib 0 = Swing High, Fib 1 = Swing Low (retracement measured from high down)
   SELL: Fib 0 = Swing Low, Fib 1 = Swing High (retracement measured from low up)
   ============================================ */
function FibonacciLevels({
  fib,
  priceToY,
  x1,
  x2,
}: {
  fib: { swingHigh: number; swingLow: number; direction: 'BUY' | 'SELL' }
  priceToY: (price: number) => number
  x1: number
  x2: number
}) {
  const range = fib.swingHigh - fib.swingLow

  return (
    <g>
      {FIB_LEVELS.map(fibLevel => {
        // BUY: Fib 0 = Swing High (origin of retracement), retracement goes DOWN
        //   price = swingHigh - level * range
        // SELL: Fib 0 = Swing Low (origin of retracement), retracement goes UP
        //   price = swingLow + level * range
        const price = fib.direction === 'BUY'
          ? fib.swingHigh - fibLevel.level * range
          : fib.swingLow + fibLevel.level * range
        const y = priceToY(price)
        const isOTE = fibLevel.level === 0.71

        return (
          <g key={fibLevel.level}>
            <line
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={fibLevel.color}
              strokeWidth={isOTE ? 2 : 1}
              strokeDasharray={isOTE ? '0' : '3 3'}
              opacity={isOTE ? 0.9 : 0.5}
            />
            <text
              x={x2 + 6}
              y={y + 3}
              fill={fibLevel.color}
              fontSize={isOTE ? 8 : 7}
              fontFamily="monospace"
              fontWeight={isOTE ? 'bold' : 'normal'}
            >
              {fibLevel.label}
            </text>
            {isOTE && (
              <text
                x={x1 + 4}
                y={y - 4}
                fill="#FFD700"
                fontSize="7"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ★ INSTITUTIONAL OTE
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/* ============================================
   TradeLevelLine — Entry, SL, TP1, TP2
   ============================================ */
function TradeLevelLine({ y, x1, x2, color, label }: { y: number; x1: number; x2: number; color: string; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="1.5" strokeDasharray="6 3" opacity="0.8" />
      <rect x={x2 + 2} y={y - 7} width="32" height="14" fill={color} opacity="0.2" rx="3" />
      <text x={x2 + 6} y={y + 3} fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">{label}</text>
    </g>
  )
}

/* ============================================
   ActiveTradePath — glowing line from Entry to TP2
   ============================================ */
function ActiveTradePath({
  trade,
  priceToY,
  x,
}: {
  trade: { entry: number; tp1: number; tp2: number; currentPrice: number; direction: 'BUY' | 'SELL' }
  priceToY: (price: number) => number
  x: number
}) {
  const entryY = priceToY(trade.entry)
  const tp1Y = priceToY(trade.tp1)
  const tp2Y = priceToY(trade.tp2)
  const currentY = priceToY(trade.currentPrice)

  return (
    <g>
      {/* Glowing path from Entry → TP1 → TP2 */}
      <line x1={x - 60} y1={entryY} x2={x - 30} y2={tp1Y} stroke="#FFD700" strokeWidth="2" opacity="0.6" strokeDasharray="4 2" />
      <line x1={x - 30} y1={tp1Y} x2={x} y2={tp2Y} stroke="#00E676" strokeWidth="2" opacity="0.6" strokeDasharray="4 2" />

      {/* Current price marker on the path */}
      <circle cx={x - 30 + (currentY - entryY) / (tp2Y - entryY) * 30} cy={currentY} r="4" fill="#FFD700" opacity="0.9">
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Direction arrow */}
      {trade.direction === 'BUY' ? (
        <ArrowUp x={x - 65} y={entryY + 15} color="#FFD700" />
      ) : (
        <ArrowDown x={x - 65} y={entryY - 15} color="#FFD700" />
      )}
    </g>
  )
}

/* ============================================
   TradeStatusBadge
   ============================================ */
function TradeStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { icon: string; color: string; bg: string }> = {
    WAITING: { icon: '🟢', color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.15)' },
    READY: { icon: '🟡', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' },
    ACTIVE: { icon: '🟠', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.15)' },
    'TP1 HIT': { icon: '🔵', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.15)' },
    COMPLETED: { icon: '🏆', color: '#00E676', bg: 'rgba(0, 230, 118, 0.15)' },
    STOPPED: { icon: '🔴', color: '#FF5252', bg: 'rgba(255, 82, 82, 0.15)' },
  }
  const s = styles[status] || styles.WAITING

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}40` }}
    >
      <span>{s.icon}</span>
      <span>{status}</span>
    </div>
  )
}

/* ============================================
   AIAnalysisPanel — beside chart
   ============================================ */
function AIAnalysisPanel({ analysis, trade }: { analysis: SmartChartData['analysis']; trade: SmartChartData['trade'] }) {
  const rows = [
    { label: 'Current Trend', value: analysis.trend, color: analysis.trend === 'Bullish' ? '#00E676' : analysis.trend === 'Bearish' ? '#FF5252' : '#9E9E9E' },
    { label: 'Market Structure', value: analysis.marketStructure, color: analysis.marketStructure === 'Bullish' ? '#00E676' : '#FF5252' },
    { label: 'Liquidity', value: analysis.liquidity, color: analysis.liquidity === 'Swept' ? '#FFD600' : '#9E9E9E' },
    { label: 'OTE', value: analysis.ote, color: analysis.ote === 'Reached' ? '#FFD700' : '#9E9E9E' },
    { label: 'Order Block', value: analysis.orderBlock, color: analysis.orderBlock === 'Fresh' ? '#00E676' : '#9E9E9E' },
    { label: 'Session', value: analysis.session, color: '#FFD700' },
    { label: 'Confidence', value: `${analysis.confidence}%`, color: analysis.confidence >= 85 ? '#00E676' : analysis.confidence >= 70 ? '#FFD700' : '#FF9800' },
  ]

  return (
    <div className="rounded-xl p-4 h-full" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg glass-gold flex items-center justify-center">
          <Zap className="w-3 h-3 text-[#FFD700]" strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">AI Analysis</span>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono font-semibold" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Trade status */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Trade Status</span>
          <TradeStatusBadge status={analysis.tradeStatus} />
        </div>

        {trade && (
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Direction</span>
              <span className="font-mono font-bold" style={{ color: trade.direction === 'BUY' ? '#00E676' : '#FF5252' }}>{trade.direction}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Entry</span>
              <span className="font-mono font-bold text-[#00E5FF]">${trade.entry.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">SL</span>
              <span className="font-mono font-bold text-[#FF5252]">${trade.stopLoss.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">TP1</span>
              <span className="font-mono font-bold text-[#2196F3]">${trade.tp1.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">TP2</span>
              <span className="font-mono font-bold text-[#00E676]">${trade.tp2.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   TradeLifecycle — visual flow diagram
   WAITING → READY → ENTRY → ACTIVE → TP1 → TP2 → COMPLETED
   ============================================ */
function TradeLifecycle({ status }: { status: string }) {
  const stages = [
    { id: 'WAITING', label: 'WAITING', icon: '🟢', sub: ['Detect HTF Bias', 'Detect Structure', 'Detect Liquidity', 'Detect OTE', 'Detect Order Block', 'Detect Confirmation'] },
    { id: 'READY', label: 'READY FOR ENTRY', icon: '🟡' },
    { id: 'ENTRY', label: 'ENTRY TRIGGERED', icon: '⚡' },
    { id: 'ACTIVE', label: 'ACTIVE TRADE', icon: '🟠', sub: ['Progress %', 'Distance to TP1', 'Distance to TP2'] },
    { id: 'TP1', label: 'TP1 HIT', icon: '🔵' },
    { id: 'TP2', label: 'TP2 HIT', icon: '🟢' },
    { id: 'COMPLETED', label: 'COMPLETED', icon: '🏆' },
  ]

  // Map the analysis status to lifecycle stage index
  const statusMap: Record<string, number> = {
    'WAITING': 0,
    'READY': 1,
    'ACTIVE': 3,
    'TP1 HIT': 4,
    'COMPLETED': 6,
    'STOPPED': -1,
  }
  const currentIdx = statusMap[status] ?? 0

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-3.5 h-3.5 text-[#FFD700]" strokeWidth={2.5} />
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">Trade Lifecycle</span>
      </div>

      <div className="space-y-0">
        {stages.map((stage, i) => {
          const isPassed = i <= currentIdx
          const isCurrent = i === currentIdx
          const isStopped = status === 'STOPPED'

          return (
            <React.Fragment key={stage.id}>
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-300',
                      isCurrent && 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-background scale-110',
                    )}
                    style={{
                      background: isPassed
                        ? (stage.id === 'COMPLETED' ? '#00E676' : stage.id === 'TP1' ? '#2196F3' : stage.id === 'TP2' ? '#00E676' : stage.id === 'ACTIVE' ? '#FF9800' : stage.id === 'READY' ? '#FFD700' : '#9E9E9E')
                        : 'var(--muted)',
                      opacity: isPassed ? 1 : 0.4,
                    }}
                  >
                    {stage.icon}
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className="w-0.5 h-4 mt-0.5"
                      style={{ background: i < currentIdx ? '#FFD700' : 'var(--border)' }}
                    />
                  )}
                </div>
                <div className="pt-0.5 pb-2">
                  <div
                    className={cn('text-[11px] font-mono font-bold uppercase tracking-wide', isPassed ? 'text-foreground' : 'text-muted-foreground')}
                    style={{ opacity: isPassed ? 1 : 0.5 }}
                  >
                    {stage.label}
                  </div>
                  {stage.sub && isCurrent && (
                    <div className="mt-1 space-y-0.5">
                      {stage.sub.map((s, j) => (
                        <div key={j} className="text-[9px] text-muted-foreground flex items-center gap-1">
                          <span className="text-[#FFD700]">├──</span> {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          )
        })}
        {isStopped && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm">🔴</span>
            <span className="text-[11px] font-mono font-bold text-[#FF5252] uppercase">STOP LOSS HIT — Trade Invalidated</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   FibonacciOrdering — visual level hierarchy
   Shows the Fibonacci levels from top to bottom with trade markers
   ============================================ */
function FibonacciOrdering({
  fib,
  trade,
}: {
  fib: SmartChartData['fibonacci']
  trade: SmartChartData['trade']
}) {
  if (!fib || !trade) return null

  const range = fib.swingHigh - fib.swingLow
  const direction = fib.direction

  // Build levels array with prices (sorted top to bottom = highest price first)
  const levels = [
    { label: 'TP2 (Fib -0.21)', icon: '🟢', color: '#00E676', price: trade.tp2 },
    { label: 'TP1 (Fib 0)', icon: '🔵', color: '#2196F3', price: trade.tp1 },
    { label: 'Current Price', icon: '🟡', color: '#FFD700', price: trade.currentPrice },
    { label: 'Entry (Fib 0.71)', icon: '🟠', color: '#FF9800', price: trade.entry },
    { label: 'Stop Loss (Fib 0.91 / Structural)', icon: '🔴', color: '#FF5252', price: trade.stopLoss },
  ]

  // Sort by price descending (highest at top) for BUY, ascending for SELL
  const sorted = direction === 'BUY'
    ? [...levels].sort((a, b) => b.price - a.price)
    : [...levels].sort((a, b) => a.price - b.price)

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-3.5 h-3.5 text-[#FFD700]" strokeWidth={2.5} />
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">
          Fibonacci Levels · {direction}
        </span>
      </div>

      <div className="space-y-1">
        {sorted.map((level, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm shrink-0">{level.icon}</span>
            <div
              className="flex-1 h-7 rounded-md flex items-center justify-between px-2.5 transition-all duration-300"
              style={{
                background: `${level.color}15`,
                border: `1px solid ${level.color}40`,
              }}
            >
              <span className="text-[10px] font-mono font-semibold" style={{ color: level.color }}>
                {level.label}
              </span>
              <span className="text-[10px] font-mono font-bold" style={{ color: level.color }}>
                ${level.price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Range info */}
      <div className="mt-3 pt-2 border-t flex items-center justify-between text-[9px] font-mono text-muted-foreground" style={{ borderColor: 'var(--border)' }}>
        <span>Swing High: ${fib.swingHigh.toFixed(2)}</span>
        <span>Range: ${range.toFixed(2)}</span>
        <span>Swing Low: ${fib.swingLow.toFixed(2)}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono uppercase text-[#FFD700]">Progress</span>
          <span className="text-[9px] font-mono font-bold text-foreground">{trade.progressPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${trade.progressPercent}%`,
              background: 'linear-gradient(90deg, #FFD700, #00E676)',
              boxShadow: '0 0 6px rgba(255, 215, 0, 0.5)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Helper: Calculate trade levels dynamically from Swing High/Low
   NEVER use placeholder numbers — all prices derived from Fibonacci

   BUY (bullish setup):
     Entry   = Fib 0.71 = Swing High - 0.71 * range (deep retracement)
     TP1     = Fib 0    = Swing High (previous impulse target)
     TP2     = Fib -0.21 = Swing High + 0.21 * range (extension above)
     StopLoss = Swing Low - buffer (structural invalidation, or Fib 0.91)

   SELL (bearish setup):
     Entry   = Fib 0.71 = Swing Low + 0.71 * range (deep retracement)
     TP1     = Fib 0    = Swing Low (previous impulse target)
     TP2     = Fib -0.21 = Swing Low - 0.21 * range (extension below)
     StopLoss = Swing High + buffer (structural invalidation, or Fib 0.91)
   ============================================ */
export function calculateTradeLevels(
  swingHigh: number,
  swingLow: number,
  direction: 'BUY' | 'SELL',
  currentPrice?: number,
): {
  entry: number
  stopLoss: number
  tp1: number
  tp2: number
  currentPrice: number
  progressPercent: number
} {
  const range = swingHigh - swingLow

  if (direction === 'BUY') {
    const entry = swingHigh - 0.71 * range       // Fib 0.71 retracement
    const tp1 = swingHigh                         // Fib 0 = previous impulse high
    const tp2 = swingHigh + 0.21 * range          // Fib -0.21 extension above
    const stopLoss = swingLow - range * 0.02      // Structural invalidation below swing low
    const price = currentPrice ?? (entry + (tp1 - entry) * 0.63) // Default: 63% to TP1
    const progress = Math.max(0, Math.min(100, ((price - entry) / (tp2 - entry)) * 100))

    return { entry, stopLoss, tp1, tp2, currentPrice: price, progressPercent: Math.round(progress) }
  } else {
    const entry = swingLow + 0.71 * range         // Fib 0.71 retracement
    const tp1 = swingLow                           // Fib 0 = previous impulse low
    const tp2 = swingLow - 0.21 * range            // Fib -0.21 extension below
    const stopLoss = swingHigh + range * 0.02      // Structural invalidation above swing high
    const price = currentPrice ?? (entry - (entry - tp1) * 0.63) // Default: 63% to TP1
    const progress = Math.max(0, Math.min(100, ((entry - price) / (entry - tp2)) * 100))

    return { entry, stopLoss, tp1, tp2, currentPrice: price, progressPercent: Math.round(progress) }
  }
}

/* ============================================
   Helper: Generate sample SmartChartData for demo
   All trade prices calculated dynamically from Swing High/Low
   ============================================ */
export function generateSampleSmartChartData(basePrice = 4000): SmartChartData {
  // Generate 50 candles with a trend
  const candles: SmartChartCandle[] = Array.from({ length: 50 }, (_, i) => {
    const trend = i < 20 ? -1 : i < 35 ? 0.5 : 1
    const volatility = Math.sin(i * 0.2) * 12 + (Math.random() - 0.5) * 8
    const open = basePrice + (i - 25) * 3 + volatility
    const close = open + trend * (Math.random() * 8 + 3)
    const high = Math.max(open, close) + Math.random() * 5
    const low = Math.min(open, close) - Math.random() * 5
    return { open, high, low, close, time: Date.now() - (50 - i) * 60000 }
  })

  // Identify swings
  const swingHighIdx = 20
  const swingLowIdx = 35
  const swingHighPrice = candles[swingHighIdx].high
  const swingLowPrice = candles[swingLowIdx].low
  const range = swingHighPrice - swingLowPrice

  // Calculate ALL trade levels dynamically from Fibonacci
  const direction: 'BUY' | 'SELL' = 'BUY'
  const levels = calculateTradeLevels(swingHighPrice, swingLowPrice, direction)

  return {
    candles,
    swings: [
      { type: 'high', price: swingHighPrice, index: swingHighIdx, label: 'Swing High' },
      { type: 'low', price: swingLowPrice, index: swingLowIdx, label: 'Swing Low' },
    ],
    structures: [
      { type: 'external', from: swingHighPrice, to: swingLowPrice, fromIndex: swingHighIdx, toIndex: swingLowIdx },
      { type: 'internal', from: candles[10].high, to: candles[15].low, fromIndex: 10, toIndex: 15 },
    ],
    bos: [
      { type: 'BOS', price: candles[40].close, index: 40, direction: 'up' as const },
      { type: 'MSS', price: candles[45].close, index: 45, direction: 'up' as const },
    ],
    sweeps: [
      { type: 'buy_side', price: swingHighPrice + 2, index: 18 },
      { type: 'sell_side', price: swingLowPrice - 2, index: 33 },
    ],
    orderBlocks: [
      { type: 'bullish', top: candles[30].high, bottom: candles[30].low, startIndex: 30, endIndex: 48, mitigated: false },
      { type: 'bearish', top: candles[15].high, bottom: candles[15].low, startIndex: 15, endIndex: 25, mitigated: true },
    ],
    fvgs: [
      { type: 'bullish', top: candles[42].high, bottom: candles[41].low, startIndex: 41, endIndex: 44 },
    ],
    fibonacci: {
      swingHigh: swingHighPrice,
      swingLow: swingLowPrice,
      direction,
    },
    trade: {
      status: 'ACTIVE',
      direction,
      entry: levels.entry,           // Fib 0.71 — calculated from swing
      stopLoss: levels.stopLoss,     // Structural invalidation — calculated from swing
      tp1: levels.tp1,               // Fib 0 — calculated from swing
      tp2: levels.tp2,               // Fib -0.21 — calculated from swing
      currentPrice: levels.currentPrice,
      progressPercent: levels.progressPercent,
    },
    analysis: {
      trend: 'Bullish',
      marketStructure: 'Bullish',
      liquidity: 'Swept',
      ote: 'Reached',
      orderBlock: 'Fresh',
      session: 'London',
      confidence: 92,
      tradeStatus: 'ACTIVE',
    },
    premiumZone: { top: swingHighPrice, bottom: swingLowPrice + 0.5 * range },
    discountZone: { top: swingLowPrice + 0.5 * range, bottom: swingLowPrice },
  }
}
