'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Award } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BadgeUnlockProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    xp_reward: number
  } | null
  onClose: () => void
}

export function BadgeUnlock({ badge, onClose }: BadgeUnlockProps) {
  if (!badge) return null

  return (
    <Dialog open={!!badge} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            🎉 Badge Unlocked!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {/* Animated Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="mb-4"
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-6xl shadow-2xl">
              {badge.icon}
            </div>
          </motion.div>

          {/* Badge Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h3 className="mb-2 text-2xl font-bold">{badge.name}</h3>
            <p className="mb-4 text-muted-foreground">{badge.description}</p>

            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 dark:bg-purple-900/30">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-600">
                +{badge.xp_reward} XP Bonus
              </span>
            </div>
          </motion.div>

          {/* Confetti Effect */}
          <div className="pointer-events-none absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: '50%',
                  y: '50%',
                }}
                animate={{
                  opacity: 0,
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                }}
                className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500"
              />
            ))}
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  )
}
