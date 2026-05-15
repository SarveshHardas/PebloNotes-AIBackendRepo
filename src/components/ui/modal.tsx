"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  className?: string
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  full: "sm:max-w-[95vw] h-[95vh]",
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(sizeClasses[size], className)}>
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="font-sans text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-2 font-sans text-sm">
          {children}
        </div>

        {footer && (
          <DialogFooter className="pt-2 sm:justify-end font-sans">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
