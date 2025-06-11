// Vonage service for demonstration purposes
// In a real application, we would use the actual Vonage SDK and API

export type MessageType = 'sms' | 'voice'

// Mock environment variables
const VONAGE_DEFAULT_NUMBER = process.env.VONAGE_DEFAULT_NUMBER || '12312345678'

// Mock function to send SMS via Vonage
export const sendSMS = async (
  to: string,
  text: string,
  from: string = VONAGE_DEFAULT_NUMBER
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log(`[MOCK] Sending SMS via Vonage from ${from} to ${to}: ${text}`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      messageId: `vonage-${Math.random().toString(36).substring(2, 12)}`,
    }
  } else {
    return {
      success: false,
      error: 'Failed to send SMS via Vonage. Please try again.',
    }
  }
}

// Mock function to make a voice call via Vonage
export const makeVoiceCall = async (
  to: string,
  message: string,
  from: string = VONAGE_DEFAULT_NUMBER
): Promise<{ success: boolean; callId?: string; error?: string }> => {
  console.log(`[MOCK] Making voice call via Vonage from ${from} to ${to} with message: ${message}`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate NCCO for the voice call
  const ncco = [
    {
      action: "talk",
      text: message,
      voiceName: "Amy"
    },
    {
      action: "talk",
      text: "This is an automated call from ExitPal.",
      voiceName: "Amy"
    }
  ]
  console.log(`[MOCK] NCCO: ${JSON.stringify(ncco, null, 2)}`)
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      callId: `vonage-call-${Math.random().toString(36).substring(2, 12)}`,
    }
  } else {
    return {
      success: false,
      error: 'Failed to make voice call via Vonage. Please try again.',
    }
  }
}

// Mock function to send a message (either SMS or voice call)
export const sendMessage = async (
  type: MessageType,
  to: string,
  content: string,
  from: string = VONAGE_DEFAULT_NUMBER
): Promise<{ success: boolean; id?: string; error?: string }> => {
  if (type === 'sms') {
    return sendSMS(to, content, from)
  } else {
    return makeVoiceCall(to, content, from)
  }
}