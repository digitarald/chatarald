# Tailwind CSS v4 Setup

## Overview

This project uses **Tailwind CSS v4** with the official **`@tailwindcss/vite`** plugin and modern `@theme` directive. This approach provides better performance and simpler configuration compared to PostCSS.

## Key Files

### `src/index.css`
Main CSS file with Tailwind v4 setup:

```css
@import "tailwindcss";

@theme {
  /* All custom colors, animations, etc. */
}
```

### `vite.config.ts`
Vite configuration with Tailwind plugin:

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  // ... other config
});
```

## Custom Theme

### Colors
- **Background**: `hsl(0 0% 96%)` - Light gray background
- **Foreground**: `hsl(0 0% 20%)` - Dark text
- **Primary**: `hsl(204 100% 50%)` (#007bff) - Main blue
- **Accent**: `hsl(204 70% 53%)` (#3498db) - Lighter blue
- **Muted**: `hsl(210 17% 93%)` (#e9ecef) - Subtle gray
- **Slate-900**: `hsl(210 29% 24%)` (#2c3e50) - Dark sidebar

### Animations
- **slide-in**: 200ms ease-out (message appearance)
- **fade-in**: 150ms ease-out (general transitions)
- **pulse-gentle**: 1.5s infinite (typing indicator)

## Usage

### Using Custom Colors
```tsx
<div className="bg-primary text-primary-foreground">
<div className="bg-slate-900 text-muted-foreground">
```

### Using Animations
```tsx
<div className="animate-slide-in">
<div className="animate-fade-in">
<div className="animate-pulse-gentle">
```

### Accessibility
The setup includes reduced motion support:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations respect user preferences */
}
```

## Benefits of Vite Plugin
- **Faster HMR**: Hot module replacement optimized for Vite
- **Simpler setup**: No PostCSS configuration needed
- **Better performance**: Direct Vite integration for optimized builds

## No Config File
Tailwind v4 does **not** use `tailwind.config.js`. All configuration is in CSS via `@theme`.

## shadcn/ui Integration
Components use Tailwind utilities directly. The `@theme` variables integrate seamlessly with shadcn/ui component styles.

## Testing
- **Unit tests**: Vitest with jsdom
- **Visual tests**: Playwright with screenshot comparison
- Tests run independently of dev server

## Resources
- [Tailwind CSS v4 Alpha Docs](https://tailwindcss.com/docs/v4-alpha)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
