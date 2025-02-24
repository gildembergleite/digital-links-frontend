import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="absolute z-50 top-0 bottom-0 flex flex-col items-center justify-center w-screen h-screen bg-background overflow-hidden">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-semibold text-foreground">Loading...</h2>
    </div>
  )
}