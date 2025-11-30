/* eslint-disable react-refresh/only-export-components */
import { ReactElement } from "react";
import { render, renderHook, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../modules/auth";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

const customRenderHook = <Result, Props>(
  render: (initialProps: Props) => Result,
  options?: Omit<RenderOptions, "wrapper">
) => renderHook(render, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render, customRenderHook as renderHook };
