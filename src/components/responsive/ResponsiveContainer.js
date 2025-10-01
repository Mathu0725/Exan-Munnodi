'use client';

import {
  useBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
} from '@/lib/responsive/breakpoints';

/**
 * Responsive container component
 */
export default function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  ...props
}) {
  const breakpoint = useBreakpoint();

  const getResponsiveClassName = () => {
    let responsiveClass = className;

    if (isMobile(breakpoint) && mobileClassName) {
      responsiveClass = `${responsiveClass} ${mobileClassName}`.trim();
    }

    if (isTablet(breakpoint) && tabletClassName) {
      responsiveClass = `${responsiveClass} ${tabletClassName}`.trim();
    }

    if (isDesktop(breakpoint) && desktopClassName) {
      responsiveClass = `${responsiveClass} ${desktopClassName}`.trim();
    }

    return responsiveClass;
  };

  return (
    <div className={getResponsiveClassName()} {...props}>
      {children}
    </div>
  );
}

/**
 * Responsive grid component
 */
export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = '4',
  className = '',
  ...props
}) {
  const breakpoint = useBreakpoint();

  const getGridCols = () => {
    switch (breakpoint) {
      case 'xs':
        return `grid-cols-${cols.xs}`;
      case 'sm':
        return `grid-cols-${cols.sm}`;
      case 'md':
        return `grid-cols-${cols.md}`;
      case 'lg':
      case 'xl':
      case '2xl':
        return `grid-cols-${cols.lg}`;
      default:
        return `grid-cols-${cols.xs}`;
    }
  };

  const gridClass = `grid ${getGridCols()} gap-${gap} ${className}`.trim();

  return (
    <div className={gridClass} {...props}>
      {children}
    </div>
  );
}

/**
 * Responsive text component
 */
export function ResponsiveText({
  children,
  size = { xs: 'sm', sm: 'base', md: 'lg', lg: 'xl' },
  className = '',
  ...props
}) {
  const breakpoint = useBreakpoint();

  const getTextSize = () => {
    switch (breakpoint) {
      case 'xs':
        return `text-${size.xs}`;
      case 'sm':
        return `text-${size.sm}`;
      case 'md':
        return `text-${size.md}`;
      case 'lg':
      case 'xl':
      case '2xl':
        return `text-${size.lg}`;
      default:
        return `text-${size.xs}`;
    }
  };

  const textClass = `${getTextSize()} ${className}`.trim();

  return (
    <span className={textClass} {...props}>
      {children}
    </span>
  );
}

/**
 * Responsive spacing component
 */
export function ResponsiveSpacing({
  children,
  padding = { xs: '2', sm: '4', md: '6', lg: '8' },
  margin = { xs: '0', sm: '2', md: '4', lg: '6' },
  className = '',
  ...props
}) {
  const breakpoint = useBreakpoint();

  const getSpacing = () => {
    let spacingClass = '';

    // Padding
    if (padding) {
      const paddingValue = padding[breakpoint] || padding.xs;
      spacingClass += `p-${paddingValue} `;
    }

    // Margin
    if (margin) {
      const marginValue = margin[breakpoint] || margin.xs;
      spacingClass += `m-${marginValue} `;
    }

    return spacingClass.trim();
  };

  const spacingClass = `${getSpacing()} ${className}`.trim();

  return (
    <div className={spacingClass} {...props}>
      {children}
    </div>
  );
}

/**
 * Mobile-first responsive component
 */
export function MobileFirst({
  children,
  showOn = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  className = '',
  ...props
}) {
  const breakpoint = useBreakpoint();

  if (!showOn.includes(breakpoint)) {
    return null;
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

/**
 * Desktop-only component
 */
export function DesktopOnly({ children, ...props }) {
  return (
    <MobileFirst showOn={['lg', 'xl', '2xl']} {...props}>
      {children}
    </MobileFirst>
  );
}

/**
 * Mobile-only component
 */
export function MobileOnly({ children, ...props }) {
  return (
    <MobileFirst showOn={['xs', 'sm']} {...props}>
      {children}
    </MobileFirst>
  );
}

/**
 * Tablet-only component
 */
export function TabletOnly({ children, ...props }) {
  return (
    <MobileFirst showOn={['md']} {...props}>
      {children}
    </MobileFirst>
  );
}
