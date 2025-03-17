"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement>
}>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
})

export function Popover({
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}: PopoverProps & React.HTMLAttributes<HTMLDivElement>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (typeof value === "function") {
        const nextValue = value(open)
        setUncontrolledOpen(nextValue)
        onOpenChange?.(nextValue)
      } else {
        setUncontrolledOpen(value)
        onOpenChange?.(value)
      }
    },
    [open, onOpenChange]
  )

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div {...props} className={cn("relative", props.className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

interface PopoverTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export function PopoverTrigger({
  asChild = false,
  children,
  ...props
}: PopoverTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e)
    setOpen(!open)
  }

  const Trigger = asChild ? React.cloneElement(children as React.ReactElement, {
    ref: triggerRef,
    onClick: handleClick,
    "aria-expanded": open,
    "aria-haspopup": true,
    ...props
  }) : (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup={true}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )

  return Trigger
}

interface PopoverContentProps {
  align?: "start" | "center" | "end"
  sideOffset?: number
  children: React.ReactNode
}

export function PopoverContent({
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: PopoverContentProps & React.HTMLAttributes<HTMLDivElement>) {
  const { open, triggerRef } = React.useContext(PopoverContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  
  React.useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()
      
      let left = 0
      if (align === "start") {
        left = triggerRect.left
      } else if (align === "center") {
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2)
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width
      }
      
      const top = triggerRect.bottom + sideOffset + window.scrollY
      
      setPosition({ top, left })
    }
  }, [open, align, sideOffset])
  
  // 点击外部关闭
  React.useEffect(() => {
    if (!open) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current && 
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        const { setOpen } = React.useContext(PopoverContext)
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])
  
  if (!open) return null
  
  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        props.className
      )}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}