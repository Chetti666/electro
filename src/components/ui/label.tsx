import React from 'react';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={className}
    style={{
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
      color: '#00ffff',
      fontFamily: 'var(--font-orbitron)',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
    }}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };