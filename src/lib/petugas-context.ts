'use client';

import { createContext, useContext } from 'react';

export type PetugasUser = { id: number; name: string; email: string; role: string };
export const PetugasCtx = createContext<PetugasUser | null>(null);
export const usePetugasUser = () => useContext(PetugasCtx);
