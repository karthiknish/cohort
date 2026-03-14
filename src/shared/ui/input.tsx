import { interactiveTransitionClass } from "@/lib/animation-system"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground border border-input bg-background h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs outline outline-1 outline-transparent file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 md:text-sm",
        "focus-ring-subtle focus-visible:border-primary hover:border-muted-foreground/30",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive aria-invalid:outline-destructive/50",
        interactiveTransitionClass,
        className
      )}
      {...props}
    />
  )
}

export { Input }
