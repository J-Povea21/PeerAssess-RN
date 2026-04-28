import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";

import Container from "./container";
import TOKENS from "./tokens";
import { LocalPreferencesAsyncStorage } from "../LocalPreferencesAsyncStorage";

const DIContext =
  createContext<Container | null>(null);

export function DIProvider({
  children,
}: {
  children: ReactNode;
}) {
  const container = useMemo(() => {
    const c = new Container();

    c.register(
      TOKENS.LocalPreferences,
      LocalPreferencesAsyncStorage.getInstance()
    );

    return c;
  }, []);

  return (
    <DIContext.Provider value={container}>
      {children}
    </DIContext.Provider>
  );
}

export function useDI() {
  const context = useContext(DIContext);

  if (!context) {
    throw new Error(
      "useDI must be used inside DIProvider"
    );
  }

  return context;
}