/** Tunable parameters for the Skills page category dock (cursor magnifier). */
export interface SkillNavParams {
  /** Scale of the selected category (never magnified). */
  activeScale: number;
  /** Resting scale of unselected categories. */
  inactiveScale: number;
  /** Extra scale added at the cursor centre on top of the resting scale. */
  maxBoost: number;
  /** Horizontal reach of the effect, in px each side of the cursor. */
  radius: number;
  /** Distance within which the boost stays at full (flat top), in px. */
  plateau: number;
  /** Vertical hit tolerance, in px — keeps a wrapped second row out of it. */
  vertTol: number;
  /** CSS transition duration for the scale, in ms. */
  transitionMs: number;
  /**
   * Colour blend ratio between two signals: the shared curve and a step that is
   * 1 only for the click-target category. 0 = pure curve; 1 = pure step (only
   * the click target lights up). e.g. 0.6 = 40% curve + 60% step.
   */
  colorStepMix: number;
  /** Falloff curve f(x), x in [0,1] from plateau edge (1, full) to radius (0). */
  easing: string;
}

export const SKILL_NAV_DEFAULTS: SkillNavParams = {
  activeScale: 1.18,
  inactiveScale: 0.9,
  maxBoost: 0.22,
  radius: 110,
  plateau: 55,
  vertTol: 24,
  transitionMs: 120,
  colorStepMix: 0.6,
  easing: '1 - (3x^2 - 2x^3)',
};

export type SkillNavNumberKey = Exclude<keyof SkillNavParams, 'easing'>;

export interface SliderSpec {
  key: SkillNavNumberKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const SKILL_NAV_SLIDERS: readonly SliderSpec[] = [
  { key: 'activeScale', label: 'Active scale', min: 1, max: 1.8, step: 0.01 },
  { key: 'inactiveScale', label: 'Inactive scale', min: 0.6, max: 1.1, step: 0.01 },
  { key: 'maxBoost', label: 'Max boost', min: 0, max: 0.8, step: 0.01 },
  { key: 'radius', label: 'Radius', min: 30, max: 400, step: 1 },
  { key: 'plateau', label: 'Plateau', min: 0, max: 200, step: 1 },
  { key: 'vertTol', label: 'Vertical tol', min: 6, max: 60, step: 1 },
  { key: 'transitionMs', label: 'Transition (ms)', min: 0, max: 400, step: 5 },
  { key: 'colorStepMix', label: 'Color: curve↔step', min: 0, max: 1, step: 0.05 },
];
