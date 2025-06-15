import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "../components/auth-provider"
import { FcGoogle } from "react-icons/fc"
import { AlertCircle } from "lucide-react"

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 Starting signup process...')
    
    // Validation
    if (!agreedToTerms) {
      toast({
        variant: "destructive",
        title: "Terms required",
        description: "Please agree to the Terms of Service and Privacy Policy to continue."
      })
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Password mismatch')
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure your passwords match."
      })
      return
    }
    
    if (formData.phone && !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone)) {
      console.log('❌ Invalid phone number format')
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a valid phone number."
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('📝 Calling signUp function...')
      await signUp(formData.email, formData.password, formData.phone)
      
      console.log('✅ Signup completed successfully')
      toast({
        title: "Account created",
        description: "Welcome to ExitPal!"
      })
    } catch (error) {
      console.error('💥 Signup failed in component:', error)
      
      // Enhanced error handling with specific messages
      let errorMessage = "An error occurred during sign up."
      let errorTitle = "Sign up failed"
      
      if (error instanceof Error) {
        console.log('🔍 Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        
        // Handle specific Supabase errors
        if (error.message.includes('User already registered')) {
          errorTitle = "Account already exists"
          errorMessage = "An account with this email already exists. Try logging in instead."
        } else if (error.message.includes('Invalid email')) {
          errorTitle = "Invalid email"
          errorMessage = "Please enter a valid email address."
        } else if (error.message.includes('Password')) {
          errorTitle = "Password error"
          errorMessage = "Password must be at least 6 characters long."
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorTitle = "Connection error"
          errorMessage = "Unable to connect to the server. Please check your internet connection."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) {
      toast({
        variant: "destructive",
        title: "Terms required",
        description: "Please agree to the Terms of Service and Privacy Policy to continue."
      })
      return
    }

    try {
      console.log('🔍 Starting Google sign-in...')
      await signInWithGoogle()
      
      toast({
        title: "Account created",
        description: "Welcome to ExitPal!"
      })
    } catch (error) {
      console.error('💥 Google sign-in failed:', error)
      
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: "An error occurred during Google sign-in."
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Create an account to get started with ExitPal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input 
                  id="phone"
                  name="phone"
                  type="tel" 
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to send your scheduled messages
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* 10DLC Compliance Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      SMS Service Notice
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                      ExitPal scheduled message service. Message and data rates may apply. 
                      Message frequency varies. Text HELP for help. Text STOP to opt-out. 
                      <Link to="/terms" className="underline hover:no-underline mx-1">Terms of Service</Link>
                      <Link to="/privacy" className="underline hover:no-underline">Privacy Policy</Link>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary underline-offset-4 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
                    Privacy Policy
                  </Link>
                  , and I consent to receive SMS messages as described above.
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !agreedToTerms}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              type="button" 
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={!agreedToTerms}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center text-muted-foreground w-full">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}