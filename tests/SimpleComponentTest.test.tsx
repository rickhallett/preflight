/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach } from 'vitest';

// A simple text component for testing
function SimpleText({ text = 'Default Text' }: { text?: string }) {
  return <div data-testid="simple-text">{text}</div>;
}

describe('Simple Component Test', () => {
  beforeEach(() => {
    // Reset DOM for each test
    document.body.innerHTML = '';
  });

  test('renders with default text', () => {
    const { container, debug } = render(<SimpleText />);

    // Debug output to see what's in the DOM
    console.log('Container HTML:', container.innerHTML);
    debug(container);

    // Try to query directly from the container
    const element = container.querySelector('[data-testid="simple-text"]');
    expect(element).not.toBeNull();
    expect(element?.textContent).toBe('Default Text');
  });

  test('renders with custom text', () => {
    const { container } = render(<SimpleText text="Custom Text" />);

    // Debug output
    console.log('Container HTML:', container.innerHTML);

    // Try to query directly from the container
    const element = container.querySelector('[data-testid="simple-text"]');
    expect(element).not.toBeNull();
    expect(element?.textContent).toBe('Custom Text');
  });
}); 