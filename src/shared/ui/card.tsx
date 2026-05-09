import * as React from "react"

import { interactiveTransitionClass } from "@/lib/animation-system"
import { cn } from "@/lib/utils"

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.Ref<HTMLHeadingElement>
}

const Card = ({ className, ref, ...props }: CardProps) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      interactiveTransitionClass,
      className
    )}
    {...props}
  />
)
Card.displayName = "Card"

const CardHeader = ({ className, ref, ...props }: CardProps) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
)
CardHeader.displayName = "CardHeader"

const CardTitle = ({ className, children, ref, ...props }: CardTitleProps) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children ?? <span className="sr-only">{props["aria-label"] ?? props.title ?? "Card title"}</span>}
  </h3>
)
CardTitle.displayName = "CardTitle"

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.Ref<HTMLParagraphElement>
}

const CardDescription = ({ className, ref, ...props }: CardDescriptionProps) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)
CardDescription.displayName = "CardDescription"

const CardContent = ({ className, ref, ...props }: CardProps) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
)
CardContent.displayName = "CardContent"

const CardFooter = ({ className, ref, ...props }: CardProps) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 p-6 pt-0", className)}
    {...props}
  />
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
