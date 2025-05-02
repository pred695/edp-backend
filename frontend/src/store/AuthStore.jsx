import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuth: false,
      userName: '',
      userEmail: '',
      userRole: '',
      
      addAuth: () => {
        set((state) => {
          return { ...state, isAuth: true };
        });
      },

      removeAuth: () => {
        set((state) => {
          return { ...state, isAuth: false };
        });
      },

      setUserName: (value) => {
        set((state) => {
          return { ...state, userName: value };
        });
      },

      setUserEmail: (value) => {
        set((state) => {
          return { ...state, userEmail: value };
        });
      },

      setUserRole: (value) => {
        set((state) => {
          return { ...state, userRole: value };
        });
      },
    }),
    {
      name: 'auth-store',
      getStorage: () => sessionStorage,
    }
  )
);

export default useAuthStore;