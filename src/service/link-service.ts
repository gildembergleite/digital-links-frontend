export type Link = {
  id: string
  title: string
  url: string
}

export class LinkService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Request failed')
    }

    return response.json()
  }

  static async list(accessToken: string | null): Promise<Link[]> {
    return this.request<Link[]>('/links', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  static async create(accessToken: string | null, { title, url }: Omit<Link, 'id'>): Promise<Link> {
    return this.request<Link>('/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title, url }),
    })
  }

  static async update(accessToken: string | null, id: string, link: Omit<Link, 'id'>): Promise<Link> {
    return this.request<Link>(`/links/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(link),
    })
  }

  static async delete(accessToken: string | null, id: string): Promise<void> {
    return this.request<void>(`/links/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }
}