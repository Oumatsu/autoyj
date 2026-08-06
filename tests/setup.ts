import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow();
globalThis.window = window as unknown as Window & typeof globalThis;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.CustomEvent = window.CustomEvent;
import { MutationObserver } from "happy-dom";
globalThis.MutationObserver = window.MutationObserver;

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
    TolgeeProvider: ({ children }: any) => children,
    getProviderInstance: () => {
      const React = require("react");
      return React.createContext(undefined);
    },
  };
});
