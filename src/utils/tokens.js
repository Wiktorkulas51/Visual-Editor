export const SpacingTokens = {
  NONE: '0px',
  XS: '4px',
  S: '8px',
  M: '16px',
  L: '32px',
  XL: '64px',
  '2XL': '128px',
};

export const SpacingLabels = ['None', 'XS', 'S', 'M', 'L', 'XL'];

export const FontSizes = {
  XS: '0.75rem',
  S: '0.875rem',
  M: '1rem',
  L: '1.125rem',
  XL: '1.25rem',
  '2XL': '1.5rem',
  '3XL': '1.875rem',
  '4XL': '2.25rem',
};
export const FontSizeLabels = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export const FontWeights = {
  REGULAR: '400',
  SEMIBOLD: '600',
  BOLD: '700',
};

export const LetterSpacings = {
  TIGHT: '-0.02em',
  NORMAL: '0em',
  WIDE: '0.05em',
};

export const Radii = {
  NONE: '0px',
  S: '4px',
  M: '8px',
  L: '12px',
  XL: '16px',
  FULL: '9999px',
};
export const RadiiLabels = ['NONE', 'S', 'M', 'L', 'XL', 'FULL'];

export const lookupSpacingToken = (value) => {
  const entry = Object.entries(SpacingTokens).find(([_, val]) => val === value);
  return entry ? entry[0] : null;
};

export const BorderWidths = {
  NONE: '0px',
  THIN: '1px',
  MEDIUM: '2px',
  THICK: '4px',
};
export const BorderWidthLabels = ['None', 'Thin', 'Medium', 'Thick'];

export const Shadows = {
  NONE: 'none',
  SOFT: '0 2px 10px rgba(0,0,0,0.08)',
  MEDIUM: '0 10px 25px rgba(0,0,0,0.15)',
  FLOATING: '0 20px 50px rgba(0,0,0,0.25)',
};
export const ShadowLabels = ['None', 'Soft', 'Medium', 'Floating'];
