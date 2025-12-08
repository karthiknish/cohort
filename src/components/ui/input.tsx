import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground border border-input bg-background h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs transition-all duration-200 outline outline-1 outline-transparent file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 md:text-sm",
        "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:outline-2 focus-visible:outline-primary/30 hover:border-muted-foreground/30",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive aria-invalid:outline-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
