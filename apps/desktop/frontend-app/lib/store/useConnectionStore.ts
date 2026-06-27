import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DatabaseConnection {
  engine: string;
  host: string;
  port: string;
  username: string;
  password?: string;
  database: string;
}

interface ConnectionState {
  activeConnection: DatabaseConnection | null;
  setActiveConnection: (connection: DatabaseConnection | null) => void;
  clearConnection: () => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      activeConnection: null,
      setActiveConnection: (connection) => set({ activeConnection: connection }),
      clearConnection: () => set({ activeConnection: null }),
    }),
    {
      name: 'fluxy-connection-storage', // se guarda en localStorage
    }
  )
);
