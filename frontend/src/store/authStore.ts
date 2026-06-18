import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, UserStatus } from '../types'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  status?: UserStatus
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setAuth: (userOrResponse: AuthUser | AuthResponse, token?: string, refreshToken?: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (userOrResponse: AuthUser | AuthResponse, token?: string, refreshToken?: string) => {
        // Called with just AuthResponse (login/register)
        if ('accessToken' in userOrResponse) {
          const r = userOrResponse as AuthResponse
          set({
            token: r.accessToken,
            refreshToken: r.refreshToken,
            user: { id: r.userId, email: r.email, firstName: r.firstName, lastName: r.lastName },
            isAuthenticated: true,
          })
        } else {
          // Called with partial user update (profile/status)
          set({
            token: token ?? undefined,
            refreshToken: refreshToken ?? undefined,
            user: userOrResponse as AuthUser,
            isAuthenticated: true,
          })
        }
      },

      clearAuth: () =>
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'teams-clone-auth' }
  )
)
