/* filepath: /Users/fabriziocagnucci/sch-pro-next/src/components/layout/PageWrapper.tsx */
import React from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageWrapper = ({ 
  children, 
  className, 
  title, 
  description, 
  actions 
}: PageWrapperProps) => {
  return (
    <div className="min-h-screen page-container">
      <div className="content-wrapper">
        {(title || description || actions) && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 animate-fade-in">
            <div className="space-y-2">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-muted-foreground text-lg">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        )}
        
        <div className={cn("space-y-6 animate-slide-in-right", className)}>
          {children}
        </div>
      </div>
    </div>
  );
};