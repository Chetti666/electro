import React from 'react';

const Form = React.forwardRef<HTMLFormElement, React.HTMLAttributes<HTMLFormElement>>(({ className, ...props }, ref) => (
  <form
    ref={ref}
    className={`space-y-6 ${className}`}
    {...props}
  />
));
Form.displayName = 'Form';

export { Form };
