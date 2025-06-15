import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Phone, Copy, UserPlus, CheckCircle2 } from 'lucide-react'
import { getDefaultVonageNumber } from '../lib/message-service'

export function VonageNumberDisplay() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  
  const vonageNumber = getDefaultVonageNumber()
  
  // Format phone number for display
  const formatPhoneNumber = (number: string) => {
    // Remove any non-digit characters
    const digits = number.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX if it's a US number
    if (digits.length === 11 && digits.startsWith('1')) {
      const areaCode = digits.slice(1, 4)
      const exchange = digits.slice(4, 7)
      const lineNumber = digits.slice(7, 11)
      return `+1 (${areaCode}) ${exchange}-${lineNumber}`
    }
    
    // Fallback formatting
    return `+${digits}`
  }

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(vonageNumber)
      setCopied(true)
      toast({
        title: "Phone number copied!",
        description: "You can now add this number to your contacts."
      })
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please manually copy the number."
      })
    }
  }

  const handleAddToContacts = () => {
    // Create a vCard for easy contact addition
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:ExitPal
ORG:ExitPal
TEL:${vonageNumber}
NOTE:ExitPal - Your social escape button
END:VCARD`
    
    const blob = new Blob([vCard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'ExitPal.vcf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Contact file downloaded!",
      description: "Open the file to add ExitPal to your contacts."
    })
  }

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Your ExitPal Number
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Vonage
          </Badge>
        </div>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Messages will be sent from this number. Add it to your contacts for authenticity!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold">
                {formatPhoneNumber(vonageNumber)}
              </p>
              <p className="text-xs text-muted-foreground">
                Arkansas, United States
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyNumber}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAddToContacts}
            className="flex items-center gap-2 flex-1"
          >
            <UserPlus className="h-4 w-4" />
            Add to Contacts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyNumber}
            className="flex items-center gap-2 flex-1"
          >
            <Copy className="h-4 w-4" />
            Copy Number
          </Button>
        </div>
        
        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Pro Tip:</p>
          <p>
            Save this number as "Mom", "Boss", or "Doctor" in your contacts. 
            When you receive a message, it will appear to come from that contact, 
            making your exit excuse more believable!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}