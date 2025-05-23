/// <reference types="vitest" />
/// <reference types="vite/client" />

import "@testing-library/jest-dom";

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveTextContent(text: string): R;
  toBeVisible(): R;
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {
      // Add a dummy property to avoid empty interface error
      _customAssertionBrand?: never;
    }
  }
}
