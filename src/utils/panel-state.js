export function normalizePanelWidth(value, fallback = '360px') {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^\d*\.?\d+$/.test(trimmed)) {
    return `${trimmed}px`;
  }

  return trimmed;
}

export function buildPanelState({ active, width }) {
  const normalizedWidth = normalizePanelWidth(width);

  return {
    active: Boolean(active),
    width: normalizedWidth,
    marginRight: active ? normalizedWidth : '0px',
  };
}
