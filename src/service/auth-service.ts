export type User = {
  id: string
  name: string
  email: string
  avatar: string
  username: string
  createdAt: string
  updatedAt: string
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store',
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Request failed')
    }

    return response.json()
  }

  static async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  static async getMe(token: string): Promise<User> {
    return this.request<User>('/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }
}