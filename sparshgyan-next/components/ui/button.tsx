import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/30 hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-700/40 active:scale-[0.98]',
        destructive:
          'bg-red-600/90 text-white hover:bg-red-500 shadow-md shadow-red-900/30',
        outline:
          'border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm',
        secondary:
          'bg-white/8 text-slate-200 hover:bg-white/12 border border-white/10',
        ghost:
          'text-slate-300 hover:bg-white/8 hover:text-white',
        link:
          'text-purple-400 underline-offset-4 hover:underline hover:text-purple-300',
        success:
          'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/30 hover:from-green-500 hover:to-emerald-500',
        cyan:
          'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-blue-500',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
