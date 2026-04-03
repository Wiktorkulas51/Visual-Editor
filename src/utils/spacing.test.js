import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySpacingToStyle,
  expandBoxValues,
  normalizeSpacingValue,
} from './spacing.js';

test('normalizeSpacingValue preserves explicit units and adds px for numbers', () => {
  assert.equal(normalizeSpacingValue('12'), '12px');
  assert.equal(normalizeSpacingValue('1.5rem'), '1.5rem');
  assert.equal(normalizeSpacingValue(' 8 px '), '8px');
});

test('expandBoxValues expands shorthand into four sides', () => {
  assert.deepEqual(expandBoxValues('16px'), {
    top: '16px',
    right: '16px',
    bottom: '16px',
    left: '16px',
  });

  assert.deepEqual(expandBoxValues('8px 12px'), {
    top: '8px',
    right: '12px',
    bottom: '8px',
    left: '12px',
  });

  assert.deepEqual(expandBoxValues('4px 8px 12px 16px'), {
    top: '4px',
    right: '8px',
    bottom: '12px',
    left: '16px',
  });
});

test('applySpacingToStyle writes margin and padding sides independently', () => {
  const style = {};

  applySpacingToStyle(style, 'margin', {
    top: '4px',
    right: '8px',
    bottom: '12px',
    left: '16px',
  });

  applySpacingToStyle(style, 'padding', {
    top: '1rem',
    right: '2rem',
    bottom: '3rem',
    left: '4rem',
  });

  assert.deepEqual(style, {
    marginTop: '4px',
    marginRight: '8px',
    marginBottom: '12px',
    marginLeft: '16px',
    paddingTop: '1rem',
    paddingRight: '2rem',
    paddingBottom: '3rem',
    paddingLeft: '4rem',
  });
});
