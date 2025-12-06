# LightRays Component

A React component that creates interactive WebGL light rays effects using the OGL library.

## Features

- **WebGL-powered performance**: Smooth 60fps animations using hardware acceleration
- **Mouse interaction**: Light rays can follow mouse movement
- **Customizable appearance**: Control colors, speed, spread, and more
- **Multiple ray origins**: Position rays from any edge or corner
- **Visual effects**: Noise, distortion, pulsating, and fade effects
- **Responsive**: Automatically adapts to container size changes
- **Performance optimized**: Uses intersection observer to only render when visible

## Installation

Make sure you have the `ogl` dependency installed:

```bash
npm install ogl
```

## Basic Usage

```tsx
import LightRays from '@/components/ui/LightRays';

function MyComponent() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `raysOrigin` | string | `'top-center'` | Origin position of rays: `'top-center'`, `'top-left'`, `'top-right'`, `'bottom-center'`, `'bottom-left'`, `'bottom-right'`, `'left'`, `'right'` |
| `raysColor` | string | `'#ffffff'` | Hex color of the light rays |
| `raysSpeed` | number | `1` | Animation speed multiplier |
| `lightSpread` | number | `1` | How spread out the light rays are (0.1 - 2.0) |
| `rayLength` | number | `2` | Length of the rays (0.5 - 3.0) |
| `pulsating` | boolean | `false` | Whether rays pulsate in intensity |
| `fadeDistance` | number | `1.0` | Distance over which rays fade out |
| `saturation` | number | `1.0` | Color saturation (0.0 - 1.0) |
| `followMouse` | boolean | `true` | Whether rays follow mouse movement |
| `mouseInfluence` | number | `0.1` | How much mouse affects ray direction (0.0 - 0.5) |
| `noiseAmount` | number | `0.0` | Amount of noise/grain effect (0.0 - 0.5) |
| `distortion` | number | `0.0` | Amount of wave distortion (0.0 - 0.2) |
| `className` | string | `''` | Additional CSS class names |

## Examples

### Basic Cyan Rays from Top
```tsx
<LightRays
  raysOrigin="top-center"
  raysColor="#00ffff"
  raysSpeed={1.0}
/>
```

### Red Pulsating Rays from Bottom
```tsx
<LightRays
  raysOrigin="bottom-center"
  raysColor="#ff6b6b"
  pulsating={true}
  raysSpeed={2.0}
  lightSpread={1.5}
/>
```

### Interactive Rays with Effects
```tsx
<LightRays
  raysOrigin="left"
  raysColor="#4ecdc4"
  followMouse={true}
  mouseInfluence={0.3}
  noiseAmount={0.15}
  distortion={0.08}
  rayLength={1.5}
/>
```

## Demo

Visit `/light-rays-demo` to see an interactive demo with real-time controls for all parameters.

## Performance Notes

- The component uses intersection observer to only render when visible
- WebGL context is properly cleaned up when component unmounts
- Optimized for 60fps performance on modern devices
- Automatically adjusts pixel ratio for different screen densities

## Browser Support

Requires WebGL support. Works on all modern browsers including:
- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

## CSS Styling

The component comes with basic CSS that can be customized:

```css
.light-rays-container {
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}
```

You can override styles using the `className` prop or by targeting `.light-rays-container` in your CSS.
