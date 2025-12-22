'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

/**
 * Touch-friendly Tooltip that supports both hover (desktop) and tap (mobile)
 * - On desktop: works with hover as normal
 * - On mobile: opens on tap, closes on tap outside or tap again
 */
function Tooltip({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  
  // Close tooltip when clicking/touching outside on mobile
  React.useEffect(() => {
    if (!open) return
    
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Check if it's a touch device
      if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) return
      
      // Don't close if clicking the trigger itself
      if (triggerRef.current?.contains(event.target as Node)) return
      
      setOpen(false)
    }
    
    // Use a small delay to avoid immediate close on the same tap
    const timeoutId = setTimeout(() => {
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('click', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open])
  
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root 
        data-slot="tooltip" 
        open={open}
        onOpenChange={setOpen}
        {...props}
      >
        {React.Children.map(children, (child) => {
          // Add touch handler to TooltipTrigger
          if (React.isValidElement(child) && child.type === TooltipTrigger) {
            return React.cloneElement(child as React.ReactElement<{ 
              onClick?: (e: React.MouseEvent) => void
              ref?: React.Ref<HTMLElement>
            }>, {
              ref: triggerRef,
              onClick: (e: React.MouseEvent) => {
                // Toggle on touch/click (for mobile)
                if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                  e.preventDefault()
                  setOpen(!open)
                }
                // Call original onClick if present
                const originalOnClick = (child as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props?.onClick
                if (typeof originalOnClick === 'function') {
                  originalOnClick(e)
                }
              },
            })
          }
          return child
        })}
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
