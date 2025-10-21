import { Card } from './ui/card';

export function TypingIndicator() {
  return (
    <Card 
      className="px-4 py-3.5 border-0 w-fit relative overflow-hidden"
      aria-label="AI is typing"
      style={{
        background: 'linear-gradient(135deg, hsl(210 25% 98%) 0%, hsl(210 20% 96%) 100%)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        animation: 'breathing 2.5s ease-in-out infinite'
      }}
    >
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(195 45% 85% / 0.3) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 4s ease-in-out infinite'
        }}
      />
      <div className="flex gap-1.5 items-center relative z-10">
        {[0, 0.2, 0.4].map((delay, index) => (
          <div
            key={index}
            data-testid="typing-dot"
            className="w-2 h-2 rounded-full bg-gradient-to-br from-slate-400 to-slate-500"
            style={{
              animation: 'breathing 1.5s ease-in-out infinite',
              animationDelay: `${delay}s`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        ))}
      </div>
    </Card>
  );
}
