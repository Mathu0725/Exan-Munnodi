/**
 * Responsive breakpoints and utilities
 */

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
};

/**
 * Hook for responsive breakpoints
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= 1536) {
        setBreakpoint('2xl');
      } else if (width >= 1280) {
        setBreakpoint('xl');
      } else if (width >= 1024) {
        setBreakpoint('lg');
      } else if (width >= 768) {
        setBreakpoint('md');
      } else if (width >= 640) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Check if current breakpoint is mobile
 */
export function isMobile(breakpoint) {
  return breakpoint === 'xs' || breakpoint === 'sm';
}

/**
 * Check if current breakpoint is tablet
 */
export function isTablet(breakpoint) {
  return breakpoint === 'md';
}

/**
 * Check if current breakpoint is desktop
 */
export function isDesktop(breakpoint) {
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
}

/**
 * Get responsive class names based on breakpoint
 */
export function getResponsiveClasses(breakpoint, classes) {
  const { xs, sm, md, lg, xl, '2xl': xxl } = classes;

  let responsiveClass = xs || '';

  if (breakpoint === 'sm' && sm) responsiveClass = sm;
  if (breakpoint === 'md' && md) responsiveClass = md;
  if (breakpoint === 'lg' && lg) responsiveClass = lg;
  if (breakpoint === 'xl' && xl) responsiveClass = xl;
  if (breakpoint === '2xl' && xxl) responsiveClass = xxl;

  return responsiveClass;
}

// Import React hooks
import { useState, useEffect } from 'react';
