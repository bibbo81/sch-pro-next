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
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        <div className={cn("space-y-6 animate-fade-in", className)}>
          {children}
        </div>
      </div>
    </div>
  );
};