import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildElementLabel,
  buildOverlayBoxStyles,
  buildSelectionSnapshot,
  attachHostWhenBodyReady,
  applyInspectorBoxStyles,
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

test('attachHostWhenBodyReady appends immediately when body exists', () => {
  const appended = [];
  const host = { id: 'host-node' };
  const doc = {
    body: {
      appendChild(node) {
        appended.push(node);
      },
    },
    addEventListener() {
      throw new Error('should not register a listener when body exists');
    },
    removeEventListener() {},
  };

  const cleanup = attachHostWhenBodyReady(doc, host);

  assert.deepEqual(appended, [host]);
  cleanup();
});

test('attachHostWhenBodyReady waits for DOMContentLoaded when body is missing', () => {
  const appended = [];
  let registeredHandler = null;
  const host = { id: 'host-node' };
  const doc = {
    body: null,
    addEventListener(eventName, handler) {
      if (eventName === 'DOMContentLoaded') {
        registeredHandler = handler;
      }
    },
    removeEventListener() {},
  };

  attachHostWhenBodyReady(doc, host);
  assert.equal(typeof registeredHandler, 'function');

  doc.body = {
    appendChild(node) {
      appended.push(node);
    },
  };
  registeredHandler();

  assert.deepEqual(appended, [host]);
});

test('applyInspectorBoxStyles makes overlay boxes visible without global CSS', () => {
  const box = { style: {} };

  applyInspectorBoxStyles(box, 'oklch(0.65 0.24 260 / 85%)');

  assert.deepEqual(box.style, {
    position: 'fixed',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '0.75rem',
    backgroundColor: 'transparent',
    transform: 'translateZ(0)',
    willChange: 'left, top, width, height, opacity',
    borderColor: 'oklch(0.65 0.24 260 / 85%)',
    boxShadow: '0 0 0 1px oklch(0.65 0.24 260 / 85%)',
    opacity: '0',
    transition: 'opacity 120ms ease, transform 120ms ease',
  });
});
