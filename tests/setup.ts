// Import Jest DOM matchers
import '@testing-library/jest-dom/vitest';
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";

// Add ResizeObserver mock
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}

// Add to global
global.ResizeObserver = ResizeObserverMock;

// extend vitest expect method with jest-dom matchers
expect.extend(matchers);

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Add any other global test setup here 