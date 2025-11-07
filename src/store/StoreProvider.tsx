import React, {ReactNode} from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({children}: StoreProviderProps) {
  // Zustand stores are self-contained and don't need a provider
  // This is just a placeholder for any future global store initialization
  // or store composition if needed

  return <>{children}</>;
}