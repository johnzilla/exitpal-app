import { Link } from "react-router-dom"
import { LucidePhone, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link to="/" className="flex items-center gap-2">
            <LucidePhone className="h-6 w-6" />
            <p className="text-sm font-medium">ExitPal</p>
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} ExitPal. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Built with
          </p>
          <Link 
            to="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="bg-black text-white px-2 py-1 text-xs font-semibold rounded">
              Bolt.new
            </span>
          </Link>
          <Link
            to="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}