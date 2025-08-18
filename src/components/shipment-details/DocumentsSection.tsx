'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shipment } from '@/types/shipment';
import { FileText } from 'lucide-react';

interface DocumentsSectionProps {
  shipment: Shipment;
  onUpdate: () => void;
}

export default function DocumentsSection({ shipment, onUpdate }: DocumentsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Documents section coming soon...</p>
      </CardContent>
    </Card>
  );
}