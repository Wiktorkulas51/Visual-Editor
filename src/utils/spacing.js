const SIDES = ['top', 'right', 'bottom', 'left'];

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeNumericUnit(value) {
  const normalizedWhitespace = value.replace(/\s+/g, ' ');
  const numericMatch = normalizedWhitespace.match(/^(-?\d*\.?\d+)$/);
  if (numericMatch) {
    return `${numericMatch[1]}px`;
  }

  const unitMatch = normalizedWhitespace.match(/^(-?\d*\.?\d+)\s*(px|rem|em|%|vh|vw|vmin|vmax|ch|lh|fr|ex)$/i);
  if (unitMatch) {
    return `${unitMatch[1]}${unitMatch[2].toLowerCase()}`;
  }

  return normalizedWhitespace;
}

export function normalizeSpacingValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^(calc|clamp|var)\(/i.test(trimmed)) {
    return trimmed;
  }

  return normalizeNumericUnit(trimmed);
}

export function expandBoxValues(value) {
  const normalized = normalizeSpacingValue(value);
  if (!normalized) {
    return {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };
  }

  const values = normalized.split(/\s+/);
  const [first, second, third, fourth] = values;

  if (values.length === 1) {
    return { top: first, right: first, bottom: first, left: first };
  }

  if (values.length === 2) {
    return { top: first, right: second, bottom: first, left: second };
  }

  if (values.length === 3) {
    return { top: first, right: second, bottom: third, left: second };
  }

  return {
    top: first,
    right: second,
    bottom: third,
    left: fourth ?? second,
  };
}

export function applySpacingToStyle(style, property, sides) {
  for (const side of SIDES) {
    style[`${property}${capitalize(side)}`] = normalizeSpacingValue(sides[side]) || '0px';
  }
}

export function readSpacingFromComputedStyle(computedStyle, property) {
  const sides = {};

  for (const side of SIDES) {
    sides[side] = normalizeSpacingValue(computedStyle[`${property}${capitalize(side)}`]) || '0px';
  }

  return sides;
}
