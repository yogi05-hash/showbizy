'use client'

import { useState } from 'react'

interface Message {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: string
}

interface ProjectChatProps {
  messages: Message[]
  projectTitle: string
  brief?: string
}

export default function ProjectChat({ messages, projectTitle, brief }: ProjectChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [chatMessages, setChatMessages] = useState(messages)
  const [showBrief, setShowBrief] = useState(true)

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setChatMessages(prev => [...prev, {
      id: String(Date.now()),
      user: 'You',
      avatar: '👤',
      message: newMessage,
      timestamp: 'Just now',
    }])
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <div>
          <h3 className="font-bold text-sm">Team Chat</h3>
          <p className="text-xs text-white/40">{chatMessages.length} messages</p>
        </div>
        {brief && (
          <button
            onClick={() => setShowBrief(!showBrief)}
            className="text-xs text-purple-400 hover:text-purple-300 transition"
          >
            {showBrief ? 'Hide brief' : '📌 Show brief'}
          </button>
        )}
      </div>

      {/* Pinned brief */}
      {showBrief && brief && (
        <div className="mx-4 mt-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">📌</span>
            <span className="text-xs font-bold text-purple-400">Pinned Brief</span>
          </div>
          <p className="text-xs text-white/50 line-clamp-3">{brief}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm shrink-0">
              {msg.avatar}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{msg.user}</span>
                <span className="text-xs text-white/30">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-white/70 mt-0.5">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-white/40 shrink-0"
            title="Attach file"
          >
            📎
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition flex items-center justify-center disabled:opacity-30 shrink-0"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  )
}
