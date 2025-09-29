import { Button } from "@/components/ui/button"
import { Cloud, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <Cloud className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl font-semibold text-muted-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Looks like this page got caught in a storm. Let's get you back to safety.
          </p>
        </div>

        <Button asChild size="lg" className="rounded-xl">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
