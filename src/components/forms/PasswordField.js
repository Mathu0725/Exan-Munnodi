'use client';

import { useState, forwardRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import FormField from './FormField';

/**
 * Password field component with show/hide toggle
 */
const PasswordField = forwardRef(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <FormField
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showPasswordToggle ? (showPassword ? FaEyeSlash : FaEye) : undefined
        }
        onRightIconClick={showPasswordToggle ? handleTogglePassword : undefined}
        {...props}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
