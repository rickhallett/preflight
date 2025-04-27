// Import Jest DOM matchers
import '@testing-library/jest-dom/vitest';
import { afterEach, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";
import { JSDOM } from 'jsdom';

// Setup JSDOM explicitly
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

// Set up global variables that might be missing
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Add ResizeObserver mock
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}

// Add to global
global.ResizeObserver = ResizeObserverMock;

// Mock window.scrollTo
global.scrollTo = vi.fn();

// Add other required DOM mocks
if (typeof window !== 'undefined') {
  // Mock DOM APIs not implemented in JSDOM
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Run cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Add any other global test setup here 