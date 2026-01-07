'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X } from 'lucide-react'
import PavingChatbot from './PavingChatbot'
import { config } from '@/config/config'

export default function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  // Auto-open after delay on homepage
  useEffect(() => {
    // Don't auto-open on admin pages, quote page, or if already opened
    const isAdminPage = pathname?.startsWith('/admin')
    const isQuotePage = pathname === '/quote'
    const shouldAutoOpen = config.chatbot.autoOpenOnHomepageOnly
      ? pathname === '/'
      : !isAdminPage && !isQuotePage

    if (
      !hasAutoOpened &&
      !isOpen &&
      shouldAutoOpen &&
      config.chatbot.autoOpenDelay > 0
    ) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasAutoOpened(true)
      }, config.chatbot.autoOpenDelay)

      return () => clearTimeout(timer)
    }
  }, [hasAutoOpened, isOpen, pathname])

  // Don't show on quote page (already has full chatbot)
  if (pathname === '/quote') return null

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-600 rotate-0'
            : 'bg-[#22c55e] hover:bg-[#1ea550] hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 text-white" />
            {/* Notification badge */}
            {!hasAutoOpened && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                1
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] z-50 shadow-2xl rounded-2xl overflow-hidden"
          style={{
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <PavingChatbot onClose={() => setIsOpen(false)} embedded />
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
