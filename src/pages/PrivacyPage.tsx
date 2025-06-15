import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Account Information:</strong> Email address, phone number, and account preferences.</p>
                  <p><strong>Message Data:</strong> Scheduled message content, timing, and delivery status for service functionality.</p>
                  <p><strong>Usage Data:</strong> Service usage patterns, feature interactions, and performance metrics.</p>
                  <p><strong>Technical Data:</strong> IP address, browser type, device information, and session data.</p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To provide and maintain the ExitPal messaging service</li>
                  <li>To send scheduled SMS messages and voice calls as requested</li>
                  <li>To communicate with you about your account and service updates</li>
                  <li>To improve our service quality and user experience</li>
                  <li>To ensure compliance with legal and regulatory requirements</li>
                  <li>To prevent fraud and maintain service security</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">3. SMS and Voice Service Privacy</h2>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-2">
                    SMS Service Notice
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    ExitPal scheduled message service. Message and data rates may apply. 
                    Message frequency varies. Text HELP for help. Text STOP to opt-out.
                  </p>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Message Content:</strong> We store your scheduled message content only as long as necessary to deliver the service. 
                    Messages are automatically deleted after delivery or cancellation.
                  </p>
                  <p>
                    <strong>Phone Numbers:</strong> Your phone number is used solely for delivering your scheduled messages. 
                    We do not share your phone number with third parties for marketing purposes.
                  </p>
                  <p>
                    <strong>Delivery Tracking:</strong> We track message delivery status to ensure service reliability and provide you with accurate information.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Service Providers:</strong> With Vonage and Supabase to deliver messaging services and maintain our platform</li>
                    <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                    <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of ExitPal, our users, or others</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with user notification)</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication requirements</li>
                    <li>Secure hosting with Supabase and Netlify</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights and Choices</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Access and Update:</strong> You can access and update your account information through your dashboard.</p>
                  <p><strong>Opt-out:</strong> Text "STOP" to any ExitPal number to stop receiving messages, or delete your account.</p>
                  <p><strong>Data Deletion:</strong> You can request deletion of your account and associated data at any time.</p>
                  <p><strong>Data Portability:</strong> You can request a copy of your personal data in a machine-readable format.</p>
                  <p><strong>Marketing Communications:</strong> You can opt out of promotional emails through your account settings.</p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Account Data:</strong> Retained while your account is active and for a reasonable period after deletion for legal compliance.</p>
                  <p><strong>Message Content:</strong> Deleted immediately after successful delivery or user cancellation.</p>
                  <p><strong>Usage Logs:</strong> Retained for up to 90 days for service improvement and security purposes.</p>
                  <p><strong>Legal Requirements:</strong> Some data may be retained longer if required by law or for legitimate business purposes.</p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>ExitPal uses the following third-party services:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Vonage:</strong> For SMS and voice message delivery (subject to Vonage's privacy policy)</li>
                    <li><strong>Supabase:</strong> For database and authentication services (subject to Supabase's privacy policy)</li>
                    <li><strong>Netlify:</strong> For web hosting and deployment (subject to Netlify's privacy policy)</li>
                  </ul>
                  <p>We encourage you to review the privacy policies of these third-party services.</p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Beta Service Notice</h2>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Important:</strong> ExitPal is currently in beta. During this phase, we may collect additional diagnostic information 
                    to improve service quality. All data collection remains subject to this privacy policy, and we will notify users of any significant changes.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">10. International Users</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ExitPal is operated from the United States. If you are accessing the service from outside the US, 
                  please be aware that your information may be transferred to, stored, and processed in the United States 
                  where our servers are located and our central database is operated.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ExitPal is not intended for use by children under 13 years of age. We do not knowingly collect personal information 
                  from children under 13. If you become aware that a child has provided us with personal information, please contact us 
                  and we will take steps to remove such information.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                  on this page and updating the "Last updated" date. For significant changes, we may also send you an email notification.
                </p>
              </section>

              <Separator />

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels 
                  or by replying "HELP" to any ExitPal message.
                </p>
              </section>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This Privacy Policy is effective as of the date listed above and will remain in effect except with respect to any changes 
                  in its provisions in the future, which will be in effect immediately after being posted on this page.
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