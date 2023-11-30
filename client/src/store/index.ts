"use client";

import { FilteredUser } from "../lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware"


export type Store = {
  authUser: FilteredUser | null;
  isLoggedIn: boolean;
  requestLoading: boolean;
  pincode: string;
  user: any;
  isAdmin: boolean;
  setIsAdmin: (isadmin:boolean)=>void;
  setUser: (user: any) => void;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
  setAuthUser: (user: FilteredUser | null) => void;
  setRequestLoading: (isLoading: boolean) => void;
  setPinCode: () => void;
  reset: () => void;
};

const useStore = create(persist((set) => ({
  authUser: null,
  isLoggedIn: false,
  requestLoading: false,
  user: null,
  pincode: null,
  isAdmin: false,
  setIsAdmin: (isadmin:boolean) => set((state:any) => ({ ...state,isAdmin: isadmin})),
  setUser: (newUser: any) => set((state: any) => ({ ...state, user: newUser })),
  setLoggedIn: () => set((state: any) => ({ ...state, isLoggedIn: true })),
  setLoggedOut: () => set((state: any) => ({ ...state, isLoggedIn: false })),
  setAuthUser: (user: any) => set((state: any) => ({ ...state, authUser: user })),
  setPinCode: (pincode: any) => set((state: any) => ({ ...state, pincode: pincode })),
  setRequestLoading: (isLoading: boolean) => set((state: any) => ({ ...state, requestLoading: isLoading })),
  reset: () => set({ authUser: null, requestLoading: false }),
}),
  {
    name: "user-storage",
  }
));

export default useStore;
