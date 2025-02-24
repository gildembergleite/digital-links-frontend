import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const links = [
  { title: "My Portfolio", url: "https://example.com/portfolio" },
  { title: "My Blog", url: "https://example.com/blog" },
  { title: "Latest Project", url: "https://example.com/project" },
  { title: "Contact Me", url: "mailto:example@example.com" },
]

export default function LinkTreePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src="/placeholder.svg" alt="Profile Picture" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-bold">John Doe</h1>
          <p className="mt-2 text-gray-600">Web Developer & Designer</p>
        </div>

        <div className="space-y-4">
          {links.map((link, index) => (
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

