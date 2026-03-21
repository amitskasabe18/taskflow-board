import React from 'react';
import { cn } from '@/lib/utils';

interface HtmlRendererProps {
  html: string;
  className?: string;
  fallback?: string;
}

export function HtmlRenderer({ html, className = '', fallback = '' }: HtmlRendererProps) {
  if (!html || html.trim() === '') {
    return <span className={cn('text-muted-foreground italic', className)}>{fallback || 'No description'}</span>;
  }

  return (
    <div 
      className={cn('prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_code]:font-mono [&_code]:text-sm [&_a]:text-primary [&_a]:underline', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
