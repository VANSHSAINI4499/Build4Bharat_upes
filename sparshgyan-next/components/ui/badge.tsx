import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border-purple-500/30',
        secondary:
          'border-white/10 bg-white/8 text-slate-300',
        destructive:
          'border-red-500/30 bg-red-600/20 text-red-300',
        outline:
          'border-white/15 text-slate-300',
        success:
          'border-green-500/30 bg-green-600/20 text-green-300',
        cyan:
          'border-cyan-500/30 bg-cyan-600/20 text-cyan-300',
        warning:
          'border-amber-500/30 bg-amber-600/20 text-amber-300',
        live:
          'border-red-500/40 bg-red-600/20 text-red-300 animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
