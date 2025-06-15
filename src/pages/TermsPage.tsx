import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using ExitPal ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  ExitPal is a scheduled messaging service that allows users to schedule SMS text messages and voice calls to their own phone numbers. 
                  The service is designed to help users exit social situations gracefully by providing automated messages at predetermined times.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                    SMS Service Notice: ExitPal scheduled message service. Message and data rates may apply. 
                    Message frequency varies. Text HELP for help. Text STOP to opt-out.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must only schedule messages to phone numbers you own or have explicit permission to contact</li>
                  <li>You agree not to use the service for spam, harassment, or any illegal activities</li>
                  <li>You understand that message and data rates may apply based on your mobile carrier's plan</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">4. SMS and Voice Services</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Opt-in:</strong> By providing your phone number and using our service, you consent to receive SMS messages and voice calls from ExitPal.
                  </p>
                  <p>
                    <strong>Opt-out:</strong> You may opt out of receiving messages at any time by texting "STOP" to any ExitPal number or by deleting your account.
                  </p>
                  <p>
                    <strong>Help:</strong> For assistance, text "HELP" to any ExitPal number or contact our support team.
                  </p>
                  <p>
                    <strong>Message Frequency:</strong> Message frequency varies based on your scheduled messages. You control when and how often messages are sent.
                  </p>
                  <p>
                    <strong>Carrier Charges:</strong> Message and data rates may apply. ExitPal is not responsible for carrier charges.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Privacy and Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. 
                  By using ExitPal, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Service Availability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive to provide reliable service, ExitPal does not guarantee 100% uptime or message delivery. 
                  Factors beyond our control, including but not limited to carrier issues, network problems, or device limitations, may affect service delivery.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ExitPal shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to 
                  loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Beta Service Notice</h2>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Important:</strong> ExitPal is currently in beta. The service may contain bugs, experience downtime, or undergo significant changes. 
                    Use at your own discretion and please report any issues to our support team.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ExitPal reserves the right to modify these terms at any time. We will notify users of significant changes via email or through the service. 
                  Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through our support channels or by replying "HELP" to any ExitPal message.
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  These terms are effective as of the date listed above and will remain in effect except with respect to any changes in their provisions in the future, 
                  which will be in effect immediately after being posted on this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}