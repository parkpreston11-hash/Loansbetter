import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <nav className="w-full h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-serif text-xl">
            L
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight text-foreground">LoansBetter</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/start" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link href="/start" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Calculate
          </Link>
          <Link href="/start" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Learn
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/lookup" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full px-4 h-9 inline-flex items-center">
            Loan Officer Lookup
          </Link>
          <Link href="/start" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6">
            Get Started
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 mt-8">
              <Link href="/start" className="text-lg font-medium text-foreground">
                How it works
              </Link>
              <Link href="/start" className="text-lg font-medium text-foreground">
                Calculate
              </Link>
              <Link href="/start" className="text-lg font-medium text-foreground">
                Learn
              </Link>
              <Link href="/start" className="inline-flex mt-4 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-6">
                Get Started
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}