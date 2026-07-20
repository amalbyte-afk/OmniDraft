import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  hoverable?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, children, className = '', ...props }, ref) => {
    const Component = hoverable ? motion.div : 'div';
    const motionProps = hoverable
      ? { whileHover: { y: -2 }, transition: { type: 'spring', stiffness: 300, damping: 20 } }
      : {};

    return (
      <Component
        ref={ref}
        className={`glass-card ${className}`}
        {...motionProps}
        {...props as any}
      >
        {children}
      </Component>
    );
  },
);

Card.displayName = 'Card';
export default Card;
