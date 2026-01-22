import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                cta:
                    'bg-cta text-cta-foreground shadow-md hover:shadow-lg hover:brightness-110',
                glass:
                    'bg-white/20 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/30 hover:border-white/40 shadow-sm',
                outline:
                    'border-2 border-primary bg-transparent text-primary hover:bg-primary/5',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
            },
            size: {
                default: 'h-11 px-6 py-2',
                sm: 'h-9 px-4 rounded-lg text-xs',
                lg: 'h-14 px-10 rounded-2xl text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
