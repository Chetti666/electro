import React from 'react';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={className}
    style={{
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
      color: 'var(--foreground-muted)',
    }}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
