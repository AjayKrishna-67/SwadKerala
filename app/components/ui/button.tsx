import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { trackButtonClick } from '~/utils/meta-pixel';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      asChild = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-spice text-white hover:bg-spice-600',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-navy bg-white hover:bg-navy-50 text-navy',
      secondary: 'bg-navy text-white hover:bg-navy-dark',
      ghost: 'hover:bg-gray-100 text-gray-900',
      link: 'text-spice underline-offset-4 hover:text-spice-600 hover:underline',
    } as const;

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Track button click for Meta Pixel
      const buttonName =
        typeof props.children === 'string'
          ? props.children
          : props['aria-label'] || 'Button';
      trackButtonClick(buttonName, 'UIButton');

      // Call original onClick if provided
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Comp
        className={classes}
        ref={ref}
        onClick={asChild ? undefined : handleClick}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
