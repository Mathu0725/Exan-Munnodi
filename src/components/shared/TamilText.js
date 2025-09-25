'use client';

import { useMemo } from 'react';

/**
 * TamilText component for proper Tamil text rendering
 * Supports search highlighting and proper font rendering
 */
export default function TamilText({ 
  children, 
  className = '', 
  searchTerm = '', 
  highlight = false,
  type = 'body' // 'heading', 'body', 'question', 'option'
}) {
  const processedText = useMemo(() => {
    if (!searchTerm || !highlight) {
      return children;
    }

    // Create regex for case-insensitive search
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    // Replace matches with highlighted version
    return children.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }, [children, searchTerm, highlight]);

  const getTamilClass = () => {
    const baseClass = 'tamil-support';
    switch (type) {
      case 'heading':
        return `${baseClass} tamil-heading`;
      case 'question':
        return `${baseClass} tamil-question`;
      case 'option':
        return `${baseClass} tamil-option`;
      case 'body':
      default:
        return `${baseClass} tamil-body`;
    }
  };

  if (searchTerm && highlight) {
    return (
      <span 
        className={`${getTamilClass()} ${className}`}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  }

  return (
    <span className={`${getTamilClass()} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Hook for Tamil text utilities
 */
export const useTamilText = () => {
  const isTamilText = (text) => {
    // Check if text contains Tamil characters
    const tamilRegex = /[\u0B80-\u0BFF]/;
    return tamilRegex.test(text);
  };

  const getTamilFontClass = (type = 'body') => {
    const baseClass = 'tamil-support';
    switch (type) {
      case 'heading':
        return `${baseClass} tamil-heading`;
      case 'question':
        return `${baseClass} tamil-question`;
      case 'option':
        return `${baseClass} tamil-option`;
      case 'body':
      default:
        return `${baseClass} tamil-body`;
    }
  };

  return {
    isTamilText,
    getTamilFontClass
  };
};
