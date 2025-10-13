import React from 'react';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`card hover:shadow-lg transition-shadow ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export { Card };
