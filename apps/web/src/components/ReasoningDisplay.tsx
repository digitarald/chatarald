import React from 'react';
import type { ReasoningDetail } from '@example/types';

interface ReasoningDisplayProps {
  details: ReasoningDetail[];
}

function extractReasoningContent(detail: ReasoningDetail): string {
  switch (detail.type) {
    case 'reasoning.summary':
      return detail.summary;
    case 'reasoning.text':
      return detail.text;
    case 'reasoning.encrypted':
      return '[Encrypted reasoning data]';
    default:
      return '';
  }
}

export function ReasoningDisplay({ details }: ReasoningDisplayProps) {
  return (
    <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
      {details.map((detail, index) => (
        <div
          key={detail.id || `reasoning-${index}`}
          className="text-xs opacity-70 font-mono whitespace-pre-wrap break-words"
        >
          {extractReasoningContent(detail)}
        </div>
      ))}
    </div>
  );
}
