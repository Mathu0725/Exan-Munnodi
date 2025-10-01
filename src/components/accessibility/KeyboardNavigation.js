'use client';

import { useEffect, useRef, useState } from 'react';
import { keyboardNavigation, focusManager } from '@/lib/accessibility/a11y';

/**
 * Keyboard navigation hook
 */
export function useKeyboardNavigation(items = [], initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isActive, setIsActive] = useState(false);

  const handleKeyDown = e => {
    if (!isActive) return;

    const newIndex = keyboardNavigation.handleArrowKeys(
      e,
      items,
      currentIndex,
      setCurrentIndex
    );

    // Focus the new item
    if (newIndex !== currentIndex) {
      const itemElement = document.querySelector(
        `[data-navigation-index="${newIndex}"]`
      );
      if (itemElement) {
        itemElement.focus();
      }
    }
  };

  const activate = () => setIsActive(true);
  const deactivate = () => setIsActive(false);

  return {
    currentIndex,
    isActive,
    activate,
    deactivate,
    handleKeyDown,
    setCurrentIndex,
  };
}

/**
 * Keyboard navigation container
 */
export function KeyboardNavigationContainer({
  children,
  items = [],
  onSelect,
  className = '',
  ...props
}) {
  const containerRef = useRef(null);
  const { currentIndex, isActive, activate, deactivate, handleKeyDown } =
    useKeyboardNavigation(items);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', activate);
    container.addEventListener('focusout', deactivate);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', activate);
      container.removeEventListener('focusout', deactivate);
    };
  }, [handleKeyDown, activate, deactivate]);

  useEffect(() => {
    if (onSelect && isActive) {
      onSelect(currentIndex);
    }
  }, [currentIndex, isActive, onSelect]);

  return (
    <div
      ref={containerRef}
      className={`focus:outline-none ${className}`}
      role='listbox'
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Keyboard navigation item
 */
export function KeyboardNavigationItem({
  children,
  index,
  isSelected = false,
  onSelect,
  className = '',
  ...props
}) {
  const itemRef = useRef(null);

  const handleClick = () => {
    if (onSelect) {
      onSelect(index);
    }
  };

  const handleKeyDown = e => {
    keyboardNavigation.handleEnter(e, () => {
      if (onSelect) {
        onSelect(index);
      }
    });
  };

  return (
    <div
      ref={itemRef}
      data-navigation-index={index}
      className={`
        cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}
        ${className}
      `.trim()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role='option'
      aria-selected={isSelected}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Focus trap component
 */
export function FocusTrap({ children, isActive = false, className = '' }) {
  const containerRef = useRef(null);
  const trapRef = useRef(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      trapRef.current = focusManager.createFocusTrap(containerRef.current);
      focusManager.focusFirst(containerRef.current);
    }

    return () => {
      if (trapRef.current) {
        focusManager.removeFocusTrap(trapRef.current);
      }
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Skip link component
 */
export function SkipLink({
  href,
  children = 'Skip to main content',
  className = '',
}) {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-indigo-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${className}
      `.trim()}
    >
      {children}
    </a>
  );
}

/**
 * Screen reader only text
 */
export function ScreenReaderOnly({ children, className = '' }) {
  return <span className={`sr-only ${className}`}>{children}</span>;
}

/**
 * Accessible loading spinner
 */
export function AccessibleLoadingSpinner({
  message = 'Loading...',
  className = '',
  ...props
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role='status'
      aria-live='polite'
      {...props}
    >
      <svg
        className='animate-spin h-5 w-5 text-indigo-600'
        fill='none'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
      <ScreenReaderOnly>{message}</ScreenReaderOnly>
    </div>
  );
}

/**
 * Accessible table component
 */
export function AccessibleTable({
  children,
  caption,
  className = '',
  ...props
}) {
  return (
    <div className='overflow-x-auto'>
      <table
        className={`min-w-full divide-y divide-gray-200 ${className}`}
        {...props}
      >
        {caption && <caption className='sr-only'>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

/**
 * Accessible table header
 */
export function AccessibleTableHeader({ children, className = '', ...props }) {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
}

/**
 * Accessible table body
 */
export function AccessibleTableBody({ children, className = '', ...props }) {
  return (
    <tbody
      className={`bg-white divide-y divide-gray-200 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

/**
 * Accessible table row
 */
export function AccessibleTableRow({ children, className = '', ...props }) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

/**
 * Accessible table cell
 */
export function AccessibleTableCell({
  children,
  isHeader = false,
  scope,
  className = '',
  ...props
}) {
  const Component = isHeader ? 'th' : 'td';

  return (
    <Component
      className={`
        ${isHeader ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'}
        ${className}
      `.trim()}
      scope={scope}
      {...props}
    >
      {children}
    </Component>
  );
}
