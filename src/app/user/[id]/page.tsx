import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

type PublicResponse = {
  user: {
    name: string
    email: string
    avatar: string
  }
  links: {
    title: string
    url: string
  }[]
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default async function LinkTreePage(props) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/links/public/${props.params.id}`
  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    redirect('/')
  }

  const data: PublicResponse = await response.json()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src={data.user.avatar} alt="Profile Picture" />
            <AvatarFallback>{data.user.name.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold">{data.user.name}</h1>
          <p className="mt-2 text-gray-600">{data.user.email}</p>
        </div>

        <div className="space-y-4">
          {data.links.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full text-lg py-6 bg-white hover:bg-gray-100 transition-colors"
              asChild
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
