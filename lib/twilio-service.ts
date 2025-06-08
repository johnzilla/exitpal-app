// This is a mock Twilio service for demonstration purposes
// In a real application, we would use the actual Twilio SDK and API

import { MessageType } from '@/lib/message-service';

// Mock environment variables
const TWILIO_DEFAULT_NUMBER = process.env.TWILIO_DEFAULT_NUMBER || '+12312345678';

// Mock function to send SMS via Twilio
export const sendSMS = async (
  to: string,
  body: string,
  from: string = TWILIO_DEFAULT_NUMBER
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log(`[MOCK] Sending SMS from ${from} to ${to}: ${body}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      messageId: `SM${Math.random().toString(36).substring(2, 12)}`,
    };
  } else {
    return {
      success: false,
      error: 'Failed to send SMS. Please try again.',
    };
  }
};

// Mock function to make a voice call via Twilio
export const makeVoiceCall = async (
  to: string,
  message: string,
  from: string = TWILIO_DEFAULT_NUMBER
): Promise<{ success: boolean; callId?: string; error?: string }> => {
  console.log(`[MOCK] Making voice call from ${from} to ${to} with message: ${message}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate TwiML for the voice call
  const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say>${message}</Say>
        <Pause length="1"/>
        <Say>This is an automated call from ExitPal.</Say>
    </Response>
  `;
  console.log(`[MOCK] TwiML: ${twiml}`);
  
  // Simulate success (90% of the time)
  if (Math.random() > 0.1) {
    return {
      success: true,
      callId: `CA${Math.random().toString(36).substring(2, 12)}`,
    };
  } else {
    return {
      success: false,
      error: 'Failed to make voice call. Please try again.',
    };
  }
};

// Mock function to send a message (either SMS or voice call)
export const sendMessage = async (
  type: MessageType,
  to: string,
  content: string,
  from: string = TWILIO_DEFAULT_NUMBER
): Promise<{ success: boolean; id?: string; error?: string }> => {
  if (type === 'sms') {
    return sendSMS(to, content, from);
  } else {
    return makeVoiceCall(to, content, from);
  }
};