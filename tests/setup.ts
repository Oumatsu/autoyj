import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow({ url: "http://localhost:3000" });
globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = window.document as any;
globalThis.navigator = window.navigator as any;
globalThis.HTMLElement = window.HTMLElement as any;
globalThis.Element = window.Element as any;
globalThis.Node = window.Node as any;
globalThis.CustomEvent = window.CustomEvent as any;
globalThis.MutationObserver = window.MutationObserver as any;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { mock } from "bun:test";

mock.module("@tolgee/react", () => {
  return {
    useTranslate: () => {
      return {
        t: (key: string, options?: { defaultValue?: string }) => {
          return options?.defaultValue || key;
        },
      };
    },
    useTolgee: () => {
      return {
        on: () => ({ unsubscribe: () => {} }),
      };
    },
    T: ({ children }: any) => children ?? null,
    TolgeeProvider: ({ children }: any) => children,
    getProviderInstance: () => {
      const React = require("react");
      return React.createContext(undefined);
    },
  };
});
