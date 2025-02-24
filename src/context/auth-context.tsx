'use client'

import LoadingScreen from '@/components/loading'
import { AuthService, User } from '@/service/auth-service'
import { usePathname, useRouter } from 'next/navigation'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

type SignupValues = {
  name: string
  email: string
  password: string
  username: string
  avatar: string
}

type AuthContextType = {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean | null
  signup: (values: SignupValues) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string | undefined>
  updateUserData: (accessToken: string) => Promise<boolean>
  registerTokens: (token: string, refreshToken: string) => Promise<void>
  setIsAuthenticated: Dispatch<SetStateAction<boolean | null>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const cookies = parseCookies()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(!pathname.includes('user'))

  useEffect(() => {
    const loadUser = async () => {
      if (!cookies.refreshToken) {
        logout()
        setTimeout(() => setIsLoading(false), 1500)
        return
      }

      const accessToken = await refreshToken()

      if (accessToken) {
        const isValidUserData = await updateUserData(accessToken)

        if (isValidUserData) {
          setIsAuthenticated(true)
          if (!pathname.includes('user')) {
            router.replace('/dash')
          }
        } else {
          logout()
        }
      } else {
        logout()
      }

      setTimeout(() => setIsLoading(false), 1500)
    }

    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signup(values: SignupValues) {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "/users"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        throw new Error("Erro ao criar usuário")
      }

      const data = await response.json()

      if (data.id) {
        toast.success("Usuário criado com sucesso!")
        const { accessToken, refreshToken } = data
        await registerTokens(accessToken, refreshToken)
        await updateUserData(accessToken)
        setIsAuthenticated(true)
        if (!pathname.includes('user')) {
          router.replace('/dash')
        }
      }

    } catch (error) {
      console.error(error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { accessToken, refreshToken } = await AuthService.login({ email, password })

      await registerTokens(accessToken, refreshToken)

      const isValidUserData = await updateUserData(accessToken)

      if (isValidUserData) {
        toast.success("Login realizado com sucesso!")
        setIsAuthenticated(true)
        if (!pathname.includes('user')) {
          router.replace('/dash')
        }
      }
    } catch (error) {
      console.error('Login failed', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      destroyCookie(undefined, 'accessToken')
      destroyCookie(undefined, 'refreshToken')
      setIsAuthenticated(false)
      setUser(null)
      router.replace('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const refreshToken = async () => {
    const deleteAccessToken = async () => destroyCookie(undefined, 'accessToken')
    
    try {
      await deleteAccessToken()

      const { accessToken } = await AuthService.refreshToken(cookies.refreshToken)
      await registerTokens(accessToken)

      return accessToken
    } catch (error) {
      console.error('Failed to refresh token', error)
    }
  }

  const updateUserData = async (accessToken: string) => {
    if (!accessToken) return false

    try {
      const userData = await AuthService.getMe(accessToken)
    
      if (userData && userData.id) {
        setUser(userData)
        return true
      }

      return false
    } catch {
      return false
    }
  }

  const registerTokens = async (accessToken: string, refreshToken?: string) => {
    setAccessToken(accessToken)
    
    if (refreshToken) {
      setCookie(undefined, 'refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    }
  }

  return (
    <AuthContext.Provider value={{ accessToken, user, isAuthenticated, signup, login, logout, refreshToken, registerTokens, updateUserData, setIsAuthenticated }}>
      {isLoading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}