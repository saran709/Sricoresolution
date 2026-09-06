import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

export function Container({ className, children, as: Component = 'div', ...props }: ContainerProps) {
  return (
    <Component className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </Component>
  );
}
