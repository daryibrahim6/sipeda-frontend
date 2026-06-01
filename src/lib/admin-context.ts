'use client';

import { createContext, useContext } from 'react';

export const SidebarToggleCtx = createContext<() => void>(() => { });
export const useSidebarToggle = () => useContext(SidebarToggleCtx);
