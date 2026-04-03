import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildElementLabel,
  buildOverlayBoxStyles,
  buildSelectionSnapshot,
} from './inspector.js';

test('buildElementLabel returns a compact tag selector', () => {
  assert.equal(
    buildElementLabel({
      tagName: 'DIV',
      id: 'hero',
      className: 'card feature highlighted',
    }),
    'div#hero.card.feature',
  );
});

test('buildOverlayBoxStyles converts a rect into positioned box styles', () => {
  assert.deepEqual(
    buildOverlayBoxStyles({ x: 10, y: 20, width: 30, height: 40 }),
    {
      left: '10px',
      top: '20px',
      width: '30px',
      height: '40px',
    },
  );
});

test('buildSelectionSnapshot rounds dimensions and includes label', () => {
  const selection = buildSelectionSnapshot({
    tagName: 'SECTION',
    id: 'content',
    className: 'page shell',
    rect: { width: 123.7, height: 45.2 },
  });

  assert.deepEqual(selection, {
    label: 'section#content.page.shell',
    tagName: 'section',
    width: '124px',
    height: '45px',
  });
});
