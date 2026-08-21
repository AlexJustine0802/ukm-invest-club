export type HeroStyle = "split" | "full-background";

export type HeroAppearance = {
  darkenVisual: boolean;
  softVisualOverlay: boolean;
  backgroundBlur: boolean;
  textShadow: boolean;
  darkenBackground: boolean;
  textBackground: boolean;
  strongTextBackground: boolean;
  bottomGradient: boolean;
  topGradient: boolean;
  panelOpacity: number;
  panelBlur: number;
};

export const DEFAULT_SPLIT_APPEARANCE: HeroAppearance = {
  darkenVisual: false,
  softVisualOverlay: true,
  backgroundBlur: false,
  textShadow: false,
  darkenBackground: false,
  textBackground: true,
  strongTextBackground: false,
  bottomGradient: false,
  topGradient: false,
  panelOpacity: 40,
  panelBlur: 16,
};

export const DEFAULT_FULL_BACKGROUND_APPEARANCE: HeroAppearance = {
  darkenVisual: false,
  softVisualOverlay: false,
  backgroundBlur: false,
  textShadow: true,
  darkenBackground: false,
  textBackground: true,
  strongTextBackground: false,
  bottomGradient: false,
  topGradient: false,
  panelOpacity: 40,
  panelBlur: 16,
};

export function normalizeHeroStyle(value: string | null | undefined): HeroStyle {
  return value === "full-background" ? "full-background" : "split";
}

export function heroAppearanceFrom(value: {
  darkenVisual?: boolean | null;
  softVisualOverlay?: boolean | null;
  backgroundBlur?: boolean | null;
  textShadow?: boolean | null;
  darkenBackground?: boolean | null;
  textBackground?: boolean | null;
  strongTextBackground?: boolean | null;
  bottomGradient?: boolean | null;
  topGradient?: boolean | null;
  panelOpacity?: number | null;
  panelBlur?: number | null;
}): HeroAppearance {
  return {
    darkenVisual: value.darkenVisual ?? DEFAULT_SPLIT_APPEARANCE.darkenVisual,
    softVisualOverlay:
      value.softVisualOverlay ?? DEFAULT_SPLIT_APPEARANCE.softVisualOverlay,
    backgroundBlur: value.backgroundBlur ?? DEFAULT_SPLIT_APPEARANCE.backgroundBlur,
    textShadow: value.textShadow ?? DEFAULT_SPLIT_APPEARANCE.textShadow,
    darkenBackground:
      value.darkenBackground ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.darkenBackground,
    textBackground:
      value.textBackground ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.textBackground,
    strongTextBackground:
      value.strongTextBackground ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.strongTextBackground,
    bottomGradient:
      value.bottomGradient ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.bottomGradient,
    topGradient:
      value.topGradient ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.topGradient,
    panelOpacity:
      value.panelOpacity ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.panelOpacity,
    panelBlur: value.panelBlur ?? DEFAULT_FULL_BACKGROUND_APPEARANCE.panelBlur,
  };
}

export type HeroBooleanKey = Exclude<
  keyof HeroAppearance,
  "panelOpacity" | "panelBlur"
>;
