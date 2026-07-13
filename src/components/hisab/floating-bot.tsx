'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, X, Send, Sparkles, Copy, Volume2, Share2, RefreshCw,
  Mic, Paperclip, Check, FileText, ThumbsUp, ThumbsDown,
  Download, ChevronDown, ChevronUp, StopCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketStore } from '@/lib/hisab/market-store'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  file?: { name: string; type: string; preview?: string }
  model?: string
  liked?: boolean
  disliked?: boolean
}

interface FloatingBotProps {
  onNavigate?: (section: string) => void
}

const STORAGE_KEY = 'apex-chat-history-v1'

export function FloatingAIBot({ onNavigate }: FloatingBotProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<{ name: string; type: string; preview?: string; base64?: string } | null>(null)
  const [speaking, setSpeaking] = React.useState<string | null>(null)
  const [expanded, setExpanded] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const recognitionRef = React.useRef<any>(null)

  const price = useMarketStore(s => s.price)
  const indicators = useMarketStore(s => s.indicators)
  const session = useMarketStore(s => s.session)

  // Load chat history from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved) && saved.length > 0) {
          setMessages(saved)
        } else {
          setMessages([welcomeMessage()])
        }
      } else {
        setMessages([welcomeMessage()])
      }
    } catch {
      setMessages([welcomeMessage()])
    }
  }, [])

  // Save to localStorage
  React.useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
      } catch {}
    }
  }, [messages])

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Speech recognition setup
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'
      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('')
        setInput(transcript)
      }
      rec.onend = () => setIsListening(false)
      rec.onerror = () => setIsListening(false)
      recognitionRef.current = rec
    }
  }, [])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setInput('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const isImage = file.type.startsWith('image/')
      setUploadedFile({
        name: file.name,
        type: file.type,
        preview: isImage ? result : undefined,
        base64: result,
      })
    }
    reader.readAsDataURL(file)
  }

  const sendMessage = async () => {
    if (!input.trim() && !uploadedFile) return
    if (isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input || (uploadedFile ? `Analyze this file: ${uploadedFile.name}` : ''),
      timestamp: Date.now(),
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type, preview: uploadedFile.preview } : undefined,
    }
    setMessages(prev => [...prev, userMsg])

    const sentInput = input
    const sentFile = uploadedFile
    setInput('')
    setUploadedFile(null)
    setIsLoading(true)

    try {
      // Build message history for context
      const chatHistory = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: sentInput || `Analyze: ${sentFile?.name}` }],
          imageBase64: sentFile?.base64,
          context: {
            price: price?.last,
            indicators: indicators ? { rsi: indicators.rsi, atr: indicators.atr, trendStrength: indicators.trendStrength } : undefined,
            session: session?.name,
          },
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'I apologize, I could not process that request.',
        timestamp: Date.now(),
        model: data.model,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again or ask a different question.',
        timestamp: Date.now(),
        model: 'error',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // ===== Message Actions =====
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleVoice = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (speaking === id) {
      window.speechSynthesis.cancel()
      setSpeaking(null)
      return
    }
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#✓⚠•📊💰🧠⚙️🕒💎🔧🏢🛡️🔔→↑↓]/g, '').replace(/\n{2,}/g, '. ')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1
    utterance.onend = () => setSpeaking(null)
    utterance.onerror = () => setSpeaking(null)
    setSpeaking(id)
    window.speechSynthesis.speak(utterance)
  }

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Apex AI Intelligence', text }) } catch {}
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  const handleRefresh = async (msgId: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex < 0) return
    const prevUserMsg = messages.slice(0, msgIndex).reverse().find(m => m.role === 'user')
    if (!prevUserMsg) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prevUserMsg.content }],
          context: { price: price?.last, indicators: indicators ? { rsi: indicators.rsi, atr: indicators.atr, trendStrength: indicators.trendStrength } : undefined, session: session?.name },
        }),
      })
      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: data.response, timestamp: Date.now() } : m))
    } catch {
      // Keep original on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = (msgId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m
      if (type === 'like') return { ...m, liked: !m.liked, disliked: false }
      return { ...m, disliked: !m.disliked, liked: false }
    }))
  }

  const handleExport = (text: string) => {
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apexbot-analysis-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apexbot-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearChat = () => {
    setMessages([welcomeMessage()])
    localStorage.removeItem(STORAGE_KEY)
  }

  const quickPrompts = [
    'Analyze current market intelligence',
    'What\'s the XAUUSD price?',
    'Explain the AILE Engine',
    'View pricing plans',
  ]

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #007AFF, #AF52DE)',
          boxShadow: '0 8px 32px rgba(0, 122, 255, 0.35), 0 0 0 1px rgba(255,255,255,0.1) inset',
        }}
        aria-label="Open AI assistant"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#34C759] border-2 border-[#050505]">
            <span className="absolute inset-0 rounded-full bg-[#34C759] animate-ping opacity-60" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'fixed z-50 flex flex-col rounded-3xl overflow-hidden',
              expanded
                ? 'inset-2 lg:inset-auto lg:bottom-24 lg:right-6 lg:w-[600px] lg:h-[700px]'
                : 'bottom-44 right-4 lg:bottom-24 lg:right-6 w-[calc(100vw-2rem)] max-w-[420px] h-[560px] max-h-[75vh]'
            )}
            style={{
              background: 'rgba(18, 18, 20, 0.98)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#34C759] border-2 border-[#121214]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tracking-tight">Apex AI</span>
                  <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                </div>
                <div className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#34C759] animate-pulse" />
                  Online · Multi-AI Engine
                </div>
              </div>
              {/* Expand/collapse */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Expand chat"
              >
                {expanded ? <ChevronDown className="w-4 h-4 text-[#F5F5F7]/60" /> : <ChevronUp className="w-4 h-4 text-[#F5F5F7]/60" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-[#F5F5F7]/60" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex flex-col gap-1.5', msg.role === 'user' ? 'items-end' : 'items-start')}
                >
                  {/* Role label */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 ml-1 mb-0.5">
                      <span className="text-[10px] font-medium text-[#007AFF]">Apex AI</span>
                      {msg.model && msg.model !== 'error' && (
                        <span className="text-[8px] text-[#F5F5F7]/30 font-mono uppercase">{msg.model.replace('multi-ai-routed', 'AI').replace('openai-reasoning', 'AI').replace('local-fallback', 'Local')}</span>
                      )}
                    </div>
                  )}

                  <div className={cn(
                    'max-w-[88%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'rounded-2xl rounded-br-md text-white'
                      : 'rounded-2xl rounded-bl-md text-[#F5F5F7]/90',
                  )} style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #007AFF, #0A84FF)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {/* File preview */}
                    {msg.file && (
                      <div className="mb-2 p-2 rounded-lg bg-black/30 flex items-center gap-2">
                        {msg.file.preview ? (
                          <img src={msg.file.preview} alt={msg.file.name} className="w-14 h-14 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#F5F5F7]/60" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium truncate">{msg.file.name}</div>
                          <div className="text-[9px] text-[#F5F5F7]/40 uppercase">{msg.file.type.split('/')[0] || 'file'}</div>
                        </div>
                      </div>
                    )}
                    {msg.content}
                  </div>

                  {/* Action buttons — ChatGPT style */}
                  {msg.role === 'assistant' && msg.model !== 'error' && (
                    <MessageActions
                      text={msg.content}
                      isSpeaking={speaking === msg.id}
                      liked={msg.liked}
                      disliked={msg.disliked}
                      onCopy={() => handleCopy(msg.content)}
                      onVoice={() => handleVoice(msg.id, msg.content)}
                      onShare={() => handleShare(msg.content)}
                      onRefresh={() => handleRefresh(msg.id)}
                      onLike={() => handleLike(msg.id, 'like')}
                      onDislike={() => handleLike(msg.id, 'dislike')}
                      onExport={() => handleExport(msg.content)}
                      onDownload={() => handleDownload(msg.content)}
                    />
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-3.5 flex gap-1.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-[#007AFF]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium hover:scale-105 transition-transform"
                    style={{ background: 'rgba(0, 122, 255, 0.1)', border: '1px solid rgba(0, 122, 255, 0.2)', color: '#0A84FF' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* File preview */}
            {uploadedFile && (
              <div className="px-4 py-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {uploadedFile.preview ? (
                  <img src={uploadedFile.preview} alt={uploadedFile.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#F5F5F7]/60" />
                  </div>
                )}
                <span className="text-[11px] text-[#F5F5F7]/60 flex-1 truncate">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-3 h-3 text-[#F5F5F7]/40" />
                </button>
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 flex items-center gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.csv,.txt,.docx,.xlsx" onChange={handleFileUpload} className="sr-only" />
              <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0" aria-label="Upload file" title="Upload file">
                <Paperclip className="w-4 h-4 text-[#F5F5F7]/50" />
              </button>
              <button
                onClick={toggleVoice}
                className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0', isListening ? 'bg-[#FF3B30]' : 'hover:bg-white/10')}
                aria-label="Voice input"
                title="Voice input"
              >
                {isListening ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[0, 1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                        className="w-1 bg-white rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <Mic className="w-4 h-4 text-[#F5F5F7]/50" />
                )}
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={isListening ? 'Analyzing Institutional Activity...' : 'Ask Apex AI or upload a chart...'}
                className="flex-1 px-3 py-2 rounded-full text-[13px] focus:outline-none placeholder:text-[#F5F5F7]/30"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#F5F5F7' }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !uploadedFile) || isLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}
                aria-label="Send message"
              >
                {isLoading ? <StopCircle className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Clear chat button */}
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="absolute top-3 right-20 text-[10px] text-[#F5F5F7]/30 hover:text-[#F5F5F7]/60 transition-colors"
              >
                Clear
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function welcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: "Welcome to ApexEAPro.\n\nI'm Apex AI.\n\nI'm continuously monitoring global financial markets, institutional liquidity, macroeconomic events, and technical conditions.\n\nHow can I help you build better market intelligence today?",
    timestamp: Date.now(),
    model: 'system',
  }
}

/**
 * MessageActions — Full ChatGPT-style action bar.
 * Copy, Read Aloud, Share, Refresh, Like, Dislike, Export, Download
 */
function MessageActions({ text, isSpeaking, liked, disliked, onCopy, onVoice, onShare, onRefresh, onLike, onDislike, onExport, onDownload }: {
  text: string
  isSpeaking: boolean
  liked?: boolean
  disliked?: boolean
  onCopy: () => void
  onVoice: () => void
  onShare: () => void
  onRefresh: () => void
  onLike: () => void
  onDislike: () => void
  onExport: () => void
  onDownload: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const actions = [
    { icon: copied ? Check : Copy, label: 'Copy', onClick: handleCopy, active: copied, color: copied ? '#34C759' : 'rgba(235,235,245,0.35)' },
    { icon: isSpeaking ? StopCircle : Volume2, label: isSpeaking ? 'Stop' : 'Read aloud', onClick: onVoice, active: isSpeaking, color: isSpeaking ? '#007AFF' : 'rgba(235,235,245,0.35)' },
    { icon: Share2, label: 'Share', onClick: onShare, color: 'rgba(235,235,245,0.35)' },
    { icon: RefreshCw, label: 'Regenerate', onClick: onRefresh, color: 'rgba(235,235,245,0.35)' },
    { icon: ThumbsUp, label: 'Good response', onClick: onLike, active: liked, color: liked ? '#34C759' : 'rgba(235,235,245,0.35)' },
    { icon: ThumbsDown, label: 'Bad response', onClick: onDislike, active: disliked, color: disliked ? '#FF3B30' : 'rgba(235,235,245,0.35)' },
    { icon: Download, label: 'Download', onClick: onDownload, color: 'rgba(235,235,245,0.35)' },
    { icon: FileText, label: 'Export', onClick: onExport, color: 'rgba(235,235,245,0.35)' },
  ]

  return (
    <div className="flex items-center gap-0.5 ml-1 flex-wrap">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={i}
            onClick={action.onClick}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors group relative"
            title={action.label}
            aria-label={action.label}
          >
            <Icon className="w-3 h-3" style={{ color: action.color }} />
          </button>
        )
      })}
    </div>
  )
}
