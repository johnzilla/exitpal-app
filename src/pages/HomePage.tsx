import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PhoneCall, MessageSquare, Clock, Shield, ArrowRight, Zap, Bug, UserPlus } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hackathon Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center text-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              🚀 Built for the Bolt.new Hackathon • Early beta version
            </span>
            <Zap className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-muted">
                <Bug className="mr-1 h-3 w-3" />
                Beta Access • Early Version
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Your Social Escape Button
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Schedule text or voice messages to help you exit awkward social situations. Never be stuck in an uncomfortable conversation again.
              </p>
              <p className="mx-auto max-w-[600px] text-sm text-muted-foreground/80 italic">
                ⚠️ This is a hackathon prototype built in 48 hours. Some features may not work perfectly yet.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup">
                <Button size="lg" className="w-full">
                  Try Beta Version <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full">
                  Log In
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              No credit card required • Built with Bolt.new • Beta testing welcome
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything You Need for a Quick Exit
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ExitPal provides all the tools you need to gracefully exit any situation.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">SMS Messages</h3>
              <p className="text-muted-foreground text-center">
                Schedule SMS messages to your phone from a variety of numbers.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <PhoneCall className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Voice Calls</h3>
              <p className="text-muted-foreground text-center">
                Receive a phone call with a customized message at your scheduled time.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Scheduled Timing</h3>
              <p className="text-muted-foreground text-center">
                Set your escape message to arrive at exactly the right moment.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Premium Numbers</h3>
              <p className="text-muted-foreground text-center">
                Upgrade to premium and choose from a variety of phone numbers for your messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Simple, Easy, Effective
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ExitPal makes it easy to get out of any awkward situation in just a few steps.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 md:gap-12 pt-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-lg font-bold">Sign Up</h3>
              <p className="text-muted-foreground text-center">
                Create your account and add your phone number.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-lg font-bold">Schedule a Message</h3>
              <p className="text-muted-foreground text-center">
                Create a text or voice message and set the time for delivery.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-lg font-bold">Add ExitPal Contact</h3>
              <p className="text-muted-foreground text-center">
                Save the ExitPal number in your phone as "Mom", "Boss", or any trusted contact name.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                4
              </div>
              <h3 className="text-lg font-bold">Make Your Exit</h3>
              <p className="text-muted-foreground text-center">
                When your message arrives, use it as an excuse to leave gracefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Notice Section */}
      <section className="py-12 md:py-24 bg-amber-50 dark:bg-amber-950/20 border-y border-amber-200 dark:border-amber-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Bug className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Beta Version Notice</h2>
              <Bug className="h-6 w-6" />
            </div>
            <div className="max-w-3xl space-y-3">
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                🚧 This app was built in 48 hours for the Bolt.new hackathon! 🚧
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                This is an early prototype, so you may encounter bugs or features that don't work perfectly yet. 
                We're actively working on improvements and appreciate your patience as we continue development.
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs italic">
                Built with Bolt.new's AI-powered development platform during the hackathon.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Try ExitPal?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted md:text-xl/relaxed">
              Join ExitPal's beta program and help us improve the app while gaining your social freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="w-full">
                  Try Beta Version
                </Button>
              </Link>
            </div>
            <p className="text-xs opacity-75">
              No payment required • Beta testing welcome • Hackathon edition
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}