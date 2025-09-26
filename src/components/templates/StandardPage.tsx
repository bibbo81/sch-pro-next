'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StandardPageProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  cards?: Array<{
    title: string;
    description?: string;
    content: React.ReactNode;
    variant?: 'glass' | 'frosted' | 'solid';
    badge?: {
      text: string;
      // ✅ AGGIUNGI 'glass' AL TIPO
      variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'glass';
    };
  }>;
  layout?: 'grid' | 'list' | 'masonry';
  gridCols?: 1 | 2 | 3 | 4;
}

// ✅ FUNZIONE HELPER PER GESTIRE LE VARIANTI CARD
const getCardVariantClasses = (variant?: string) => {
  switch (variant) {
    case 'glass':
      return 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl'
    case 'frosted':
      return 'bg-white/60 backdrop-blur-md border border-white/30 shadow-lg'
    case 'solid':
    default:
      return 'bg-white border border-gray-200 shadow-sm'
  }
}

// ✅ FUNZIONE HELPER PER CONVERTIRE BADGE VARIANT
const getBadgeVariant = (variant?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  // Converte varianti personalizzate in varianti standard di shadcn/ui
  switch (variant) {
    case 'glass':
      return 'default'
    case 'secondary':
      return 'secondary'
    case 'destructive':
      return 'destructive'
    case 'outline':
      return 'outline'
    default:
      return 'default'
  }
}

export const StandardPage = ({
  title,
  description,
  actions,
  children,
  cards,
  layout = 'grid',
  gridCols = 3
}: StandardPageProps) => {
  
  const getGridClass = () => {
    const cols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };
    return cols[gridCols];
  };

  const getLayoutClass = () => {
    switch(layout) {
      case 'list':
        return 'flex flex-col space-y-4';
      case 'masonry':
        return `columns-1 md:columns-2 lg:columns-${gridCols} gap-6 space-y-0`;
      default:
        return `grid ${getGridClass()} gap-6`;
    }
  };

  return (
    <PageWrapper 
      title={title} 
      description={description} 
      actions={actions}
    >
      {/* Cards Section */}
      {cards && cards.length > 0 && (
        <div className={getLayoutClass()}>
          {cards.map((card, index) => (
            <Card 
              key={index} 
              // ✅ USA className CON VARIANTI
              className={`
                ${layout === 'masonry' ? 'break-inside-avoid mb-6' : ''}
                ${getCardVariantClasses(card.variant)}
              `.trim()}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {card.title}
                  </CardTitle>
                  {card.badge && (
                    <Badge 
                      // ✅ USA LA FUNZIONE HELPER
                      variant={getBadgeVariant(card.badge.variant)}
                    >
                      {card.badge.text}
                    </Badge>
                  )}
                </div>
                {card.description && (
                  <CardDescription className="mt-2">
                    {card.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {card.content}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Main Content */}
      <div className="animate-fade-in">
        {children}
      </div>
    </PageWrapper>
  );
};

// ✅ EXPORT NAMED PER FACILITÀ D'USO
export default StandardPage;

// ✅ VARIANTI PRE-CONFIGURATE
export const DashboardPage = (props: Omit<StandardPageProps, 'layout' | 'gridCols'>) => (
  <StandardPage {...props} layout="grid" gridCols={3} />
);

export const ListPage = (props: Omit<StandardPageProps, 'layout'>) => (
  <StandardPage {...props} layout="list" />
);

export const MasonryPage = (props: Omit<StandardPageProps, 'layout' | 'gridCols'>) => (
  <StandardPage {...props} layout="masonry" gridCols={3} />
);