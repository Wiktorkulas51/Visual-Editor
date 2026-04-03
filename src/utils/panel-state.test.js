import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPanelState,
  normalizePanelWidth,
} from './panel-state.js';

test('normalizePanelWidth preserves units and adds px for numeric values', () => {
  assert.equal(normalizePanelWidth(360), '360px');
  assert.equal(normalizePanelWidth('420'), '420px');
  assert.equal(normalizePanelWidth('24rem'), '24rem');
});

test('buildPanelState returns a shifted margin when active', () => {
  assert.deepEqual(buildPanelState({ active: true, width: '420' }), {
    active: true,
    width: '420px',
    marginRight: '420px',
  });

  assert.deepEqual(buildPanelState({ active: false, width: '420px' }), {
    active: false,
    width: '420px',
    marginRight: '0px',
  });
});
