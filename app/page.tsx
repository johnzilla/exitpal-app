import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PhoneCall, MessageSquare, Clock, Shield, ArrowRight, Zap, Bug } from "lucide-react";

export const metadata: Metadata = {
  title: "ExitPal - Your Social Escape Button",
  description: "Schedule text or voice messages to help you exit awkward social situations",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hackathon Banner */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center text-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              🚀 Built for the Bolt.new Hackathon • Fresh out of the code oven!
            </span>
            <Zap className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Your Social Escape Button
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Schedule text or voice messages to help you exit awkward social situations. Never be stuck in an uncomfortable conversation again.
              </p>
              
              {/* Beta Notice */}
              <div className="mx-auto max-w-[600px] mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-amber-800 dark:text-amber-200">
                  <Bug className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    🧪 Beta Access • Expect some quirks while we perfect your escape routes!
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup">
                <Button size="lg" className="w-full">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full">
                  Log In
                </Button>
              </Link>
            </div>
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
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pt-12">
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
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-4 md:col-span-2 lg:col-span-1">
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
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12 pt-12">
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
              <h3 className="text-lg font-bold">Make Your Exit</h3>
              <p className="text-muted-foreground text-center">
                When your message arrives, use it as an excuse to leave gracefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon Info Section */}
      <section className="py-12 md:py-24 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-medium">
              🏆 Hackathon Project
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Built with Lightning Speed ⚡
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              This app was crafted during the Bolt.new hackathon using cutting-edge AI development tools. 
              We're still ironing out the wrinkles, so if you encounter any bugs, consider them "features in disguise"! 
              Your feedback helps us make ExitPal even better.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
              <span>🛠️ Built with Bolt.new</span>
              <span>•</span>
              <span>🚧 Beta Version</span>
              <span>•</span>
              <span>🐛 Bug Reports Welcome</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Never Be Stuck Again?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted md:text-xl/relaxed">
              Join ExitPal today and take control of your social situations. Beta bugs included at no extra charge! 😉
            </p>
            <div className="flex flex-col sm:flex-row gap-3 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}