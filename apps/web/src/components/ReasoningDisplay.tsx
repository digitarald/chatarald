import React from 'react';
import type { ReasoningDetail } from '@example/types';

interface ReasoningDisplayProps {
  details: ReasoningDetail[];
}

export function ReasoningDisplay({ details }: ReasoningDisplayProps) {
  return (
    <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
      {details.map((detail, index) => {
        let content: string = '';
        
        if (detail.type === 'reasoning.summary') {
          content = detail.summary;
        } else if (detail.type === 'reasoning.text') {
          content = detail.text;
        } else if (detail.type === 'reasoning.encrypted') {
          content = '[Encrypted reasoning data]';
        }
        
        return (
          <div key={index} className="text-xs opacity-70 font-mono whitespace-pre-wrap break-words">
            {content}
          </div>
        );
      })}
    </div>
  );
}
