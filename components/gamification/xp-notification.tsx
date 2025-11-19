'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface XPNotificationProps {
  amount: number
  action: string
  show: boolean
  onComplete?: () => void
}

export function XPNotification({
  amount,
  action,
  show,
  onComplete,
}: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.3 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25,
          }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white shadow-2xl"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.2, 1, 1.2, 1],
            }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>

          <div>
            <p className="font-semibold">+{amount} XP</p>
            <p className="text-sm opacity-90">{action}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
