import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { scale: 1.015, y: -2, boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.08)' } : undefined}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'rounded-[14px] border border-border bg-surface text-text-primary shadow-subtle',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
