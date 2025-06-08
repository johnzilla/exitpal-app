import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/components/auth-provider"
import { getAvailableTwilioNumbers } from "@/lib/message-service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CheckCircle2, CreditCard, Star } from "lucide-react"

export default function PremiumPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedNumberId, setSelectedNumberId] = useState<string>("")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  
  const availableNumbers = getAvailableTwilioNumbers()

  // If user is not logged in, redirect to login
  if (!user) {
    navigate("/login")
    return null
  }

  const handleNumberSelection = (numberId: string) => {
    setSelectedNumberId(numberId)
  }

  const handleUpgrade = () => {
    if (!selectedNumberId) {
      toast({
        variant: "destructive",
        title: "Select a phone number",
        description: "Please select a phone number to continue."
      })
      return
    }
    
    setShowPaymentDialog(true)
  }

  const handleMockPayment = () => {
    // Simulate successful payment
    updateUser({ isPremium: true })
    
    toast({
      title: "Upgraded to Premium!",
      description: "You now have access to all premium features."
    })
    
    setShowPaymentDialog(false)
    
    // Redirect to dashboard
    setTimeout(() => {
      navigate("/dashboard")
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Upgrade to Premium</h1>
            <p className="text-muted-foreground">
              Get access to exclusive features and premium phone numbers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Free Plan
                </CardTitle>
                <CardDescription>
                  Current plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>Schedule SMS messages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>Schedule voice calls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>Default Twilio number</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    Premium Plan <Star className="ml-2 h-4 w-4 text-yellow-500" />
                  </CardTitle>
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Recommended
                  </span>
                </div>
                <CardDescription>
                  Unlock all features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$5<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>All Free Plan features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>Choose from premium phone numbers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>Priority message delivery</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary shrink-0" />
                    <span>Custom voice messages</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleUpgrade}>
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Premium Number</CardTitle>
              <CardDescription>
                Select a unique phone number for your scheduled messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedNumberId} onValueChange={handleNumberSelection}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableNumbers.map((number) => (
                    <div key={number.id} className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value={number.id} id={`number-${number.id}`} disabled={!user.isPremium} />
                      <Label htmlFor={`number-${number.id}`} className="flex flex-col cursor-pointer">
                        <span className="font-medium">{number.number}</span>
                        <span className="text-sm text-muted-foreground">{number.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              
              {!user.isPremium && (
                <p className="text-muted-foreground text-sm mt-4">
                  <Star className="inline-block h-4 w-4 mr-1 text-yellow-500" />
                  Upgrade to Premium to select a custom phone number
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Upgrade</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  You're about to upgrade to the Premium plan for $5/month.
                </p>
                <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                  <div className="flex justify-between">
                    <span>Premium Plan</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>$5.00</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This is a demo. No actual payment will be processed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMockPayment} className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay $5.00
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}