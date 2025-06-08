import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Log the webhook data (in a real app, you would process this)
    console.log('Voice Webhook received:', {
      From: formData.get('From'),
      To: formData.get('To'),
      CallSid: formData.get('CallSid'),
      CallStatus: formData.get('CallStatus')
    });
    
    // Respond with TwiML
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you for answering. This is a call from ExitPal.</Say>
      </Response>`,
      {
        headers: {
          'Content-Type': 'application/xml'
        }
      }
    );
  } catch (error) {
    console.error('Error processing voice webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}