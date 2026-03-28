'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid3X3, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Switch } from '@/components/ui/switch'
import { toBraille } from '@/lib/braille'

export function BrailleDisplay() {
  const showBraille = useAppStore((s) => s.showBraille)
  const windowText = useAppStore((s) => s.windowText)

  const brailleText = useMemo(
    () => (showBraille ? toBraille(windowText) : ''),
    [showBraille, windowText]
  )

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 space-y-3">
      {/* Toggle header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-600/15 border border-amber-500/25 flex items-center justify-center">
            <Grid3X3 className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Braille Unicode</p>
            <p className="text-xs text-white/40">Visual dot pattern overlay</p>
          </div>
        </div>
        <Switch
          checked={showBraille}
          onCheckedChange={(v) => useAppStore.getState().setShowBraille(v)}
          aria-label="Show Braille toggle"
        />
      </div>

      {/* Braille output */}
      <AnimatePresence>
        {showBraille && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-xl border border-amber-500/15 bg-amber-600/5 p-4 min-h-[5rem]">
              {brailleText ? (
                <p
                  className="font-mono text-2xl tracking-widest leading-relaxed text-amber-300 break-all"
                  aria-label={`Braille: ${windowText}`}
                >
                  {brailleText}
                </p>
              ) : (
                <p className="text-sm text-white/25 italic text-center py-2">
                  Start speaking to see Braille output…
                </p>
              )}
            </div>
            <p className="text-xs text-white/25 mt-2 text-center">
              Unicode Grade-1 Braille — visual reference only
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
