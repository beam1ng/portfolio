import { useMemo } from 'react';
import type { CompiledEasing } from './easing';

interface EasingPreviewProps {
  compiled: CompiledEasing;
  /** Fraction of the width that is the flat plateau (boost held at full). */
  plateauFraction: number;
}

const W = 220;
const H = 84;
const PAD = 6;

/**
 * Plots the falloff: a flat plateau at full, then the easing curve f(x) from
 * 1 → 0 across the remaining width. y is clamped to [0,1] for display only.
 */
export function EasingPreview({ compiled, plateauFraction }: EasingPreviewProps) {
  const path = useMemo(() => {
    const innerW = W - PAD * 2;
    const innerH = H - PAD * 2;
    const plateauW = innerW * Math.min(Math.max(plateauFraction, 0), 0.95);
    const toY = (v: number) => PAD + (1 - Math.min(Math.max(v, 0), 1)) * innerH;
    const points: string[] = [`M ${PAD} ${toY(1)}`, `L ${PAD + plateauW} ${toY(1)}`];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const px = PAD + plateauW + x * (innerW - plateauW);
      points.push(`L ${px.toFixed(1)} ${toY(compiled.fn(x)).toFixed(1)}`);
    }
    return points.join(' ');
  }, [compiled, plateauFraction]);

  return (
    <svg className="debug-curve" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Easing curve preview">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} className="debug-curve__axis" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} className="debug-curve__axis" />
      <path d={path} className="debug-curve__line" fill="none" />
    </svg>
  );
}
