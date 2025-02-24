'use client'

import LoadingScreen from '@/components/loading'
import { AuthService, User } from '@/service/auth-service'
import { useRouter } from 'next/navigation'
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
  user: User | null
  isAuthenticated: boolean | null
  signup: (values: SignupValues) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateUserData: () => Promise<boolean>
  registerTokens: (token: string, refreshToken: string) => Promise<void>
  setIsAuthenticated: Dispatch<SetStateAction<boolean | null>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const cookies = parseCookies()

  useEffect(() => {
    const loadUser = async () => {
      if (!cookies.accessToken || !cookies.refreshToken) {
        logout()
        setTimeout(() => setIsLoading(false), 1500)
        return
      }

      const isValidToken = await refreshToken()

      if (isValidToken) {
        const isValidUserData = await updateUserData()

        if (isValidUserData) {
          setIsAuthenticated(true)
          router.push('/dash')
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
        await updateUserData()
        setIsAuthenticated(true)
        router.push('/dash')
      }

    } catch (error) {
      console.error(error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { accessToken, refreshToken } = await AuthService.login({ email, password })

      await registerTokens(accessToken, refreshToken)

      const isValidUserData = await updateUserData()

      if (isValidUserData) router.push('/dash')
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
      router.push('/')
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

      return true
    } catch (error) {
      console.error('Failed to refresh token', error)
      return false
    }
  }

  const updateUserData = async () => {
    try {
      const userData = await AuthService.getMe(cookies.accessToken)
    
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
    setCookie(undefined, 'accessToken', accessToken, {
      maxAge: 60 * 60 * 0.5,
      path: '/',
    })
    
    if (refreshToken) {
      setCookie(undefined, 'refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, login, logout, refreshToken, registerTokens, updateUserData, setIsAuthenticated }}>
      {isLoading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}