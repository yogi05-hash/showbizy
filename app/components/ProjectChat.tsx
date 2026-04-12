'use client'

import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  message: string
  created_at: string
}

interface ProjectChatProps {
  projectId: string
  projectTitle: string
  brief?: string
  messages?: unknown[] // kept for backward compat, ignored
}

export default function ProjectChat({ projectId, projectTitle }: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name: string; avatar?: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Load user
  useEffect(() => {
    try {
      const stored = localStorage.getItem('showbizy_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?project_id=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    // Poll every 5 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [projectId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return
    setSending(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          user_id: user.id,
          user_name: user.name,
          user_avatar: user.avatar || null,
          message: newMessage.trim(),
        }),
      })

      if (res.ok) {
        setNewMessage('')
        await fetchMessages()
      }
    } catch {}
    setSending(false)
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="font-bold text-sm">{projectTitle}</h3>
        <p className="text-xs text-white/30">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-white/20 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/20 text-sm mb-2">No messages yet</p>
            <p className="text-white/10 text-xs">Be the first to say hello to your team!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = user?.id === msg.user_id
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {msg.user_avatar || msg.user_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white/60">{isMe ? 'You' : msg.user_name}</span>
                    <span className="text-[10px] text-white/20">{formatTime(msg.created_at)}</span>
                  </div>
                  <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-purple-600/20 text-white/80 rounded-tr-sm'
                      : 'bg-white/[0.06] text-white/70 rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        {user ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Type a message..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 transition"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-30"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        ) : (
          <p className="text-center text-white/30 text-sm py-2">Sign in to chat</p>
        )}
      </div>
    </div>
  )
}
