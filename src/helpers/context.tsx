import { makeObservable, observable } from "mobx";
import { Store } from "../store";
import React, { createContext, ReactNode, useContext } from "react";

export class OffscreenContext {
  store = new Store();

  constructor() {
    makeObservable(this, {
      store: observable.shallow,
    });
  }
}

const ReactContext = createContext<OffscreenContext>(null as any);

export const ContextProvider = ({
  ctx,
  children,
}: {
  ctx: OffscreenContext;
  children: ReactNode;
}) => <ReactContext.Provider value={ctx}>{children}</ReactContext.Provider>;

export const useOffscreenContext = () => useContext(ReactContext);
