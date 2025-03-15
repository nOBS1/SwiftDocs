"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: "",
  onValueChange: () => {},
})

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  ...props
}: TabsProps & React.HTMLAttributes<HTMLDivElement>) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "")
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setUncontrolledValue(newValue)
      onValueChange?.(newValue)
    },
    [onValueChange]
  )
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    role="tablist"
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps {
  value: string
  disabled?: boolean
  children: React.ReactNode
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">
>(({ className, value, disabled, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isSelected = selectedValue === value
  
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`${value}-content`}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
      onClick={() => onValueChange(value)}
      data-state={isSelected ? "active" : "inactive"}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps {
  value: string
  children: React.ReactNode
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, value, children, ...props }, ref) => {
  const { value: selectedValue } = React.useContext(TabsContext)
  const isSelected = selectedValue === value
  
  if (!isSelected) return null
  
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${value}-content`}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      data-state={isSelected ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }