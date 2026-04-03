import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInspectorToggle,
  getInspectorToggleLabel,
  getInspectorTogglePath,
} from './InspectorToggle.js';

function createStubElement(tagName) {
  let text = '';
  return {
    tagName: tagName.toUpperCase(),
    attributes: {},
    children: [],
    className: '',
    title: '',
    get textContent() {
      return text;
    },
    set textContent(value) {
      text = String(value);
      this.children = [];
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    querySelector(selector) {
      return this.children.find((child) => child.tagName === selector.toUpperCase()) ?? null;
    },
  };
}

test('getInspectorToggleLabel returns state-aware labels', () => {
  assert.equal(getInspectorToggleLabel(false), 'Pick element');
  assert.equal(getInspectorToggleLabel(true), 'Stop picking');
});

test('getInspectorTogglePath returns distinct icon paths for both states', () => {
  assert.notEqual(getInspectorTogglePath(false), getInspectorTogglePath(true));
});

test('createInspectorToggle renders an icon-only button and updates state', () => {
  const previousDocument = globalThis.document;

  globalThis.document = {
    createElement(tagName) {
      return createStubElement(tagName);
    },
    createElementNS(_namespace, tagName) {
      return createStubElement(tagName);
    },
  };

  try {
    const toggle = createInspectorToggle({ active: false });
    const button = toggle.element;
    const icon = button.children[0];
    const path = icon.children[0];

    assert.equal(button.attributes['aria-label'], 'Pick element');
    assert.equal(button.attributes['aria-pressed'], 'false');
    assert.equal(icon.attributes.class, 'h-4 w-4 shrink-0');
    assert.equal(icon.attributes.width, '16');
    assert.equal(icon.attributes.height, '16');
    assert.equal(button.className.includes('inline-flex'), true);
    assert.equal(button.textContent, '');
    assert.equal(button.children.length, 1);
    assert.equal(icon.tagName, 'SVG');
    assert.equal(path.attributes.d, getInspectorTogglePath(false));

    toggle.setActive(true);

    assert.equal(button.attributes['aria-label'], 'Stop picking');
    assert.equal(button.attributes['aria-pressed'], 'true');
    assert.equal(path.attributes.d, getInspectorTogglePath(true));
  } finally {
    globalThis.document = previousDocument;
  }
});
