import React, { type ReactElement } from "react";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

// Custom render function with providers
const render = (
  ui: ReactElement,
  {
    preloadedState = {},
    ...renderOptions
  }: { preloadedState?: Record<string, unknown> } & Omit<RenderOptions, "wrapper"> = {}
) => {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { render };
