import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md border border-primary/20 hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-md border border-destructive/20 hover:bg-destructive/90 hover:shadow-lg focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80 active:scale-[0.98]",
        outline:
          "border-2 border-input bg-white dark:bg-slate-800 shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md dark:border-slate-600 dark:hover:bg-slate-700 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm border border-secondary/20 hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-white/40 backdrop-blur-xl border border-white/60 text-slate-700 shadow-sm hover:bg-white/60 hover:shadow-md active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-lg px-7 has-[>svg]:px-5",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
