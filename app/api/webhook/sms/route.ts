import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Log the webhook data (in a real app, you would process this)
    console.log('SMS Webhook received:', {
      From: formData.get('From'),
      To: formData.get('To'),
      Body: formData.get('Body'),
      MessageSid: formData.get('MessageSid'),
      Status: formData.get('MessageStatus')
    });
    
    // Respond with TwiML (not actually used in this mock)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Thank you for your response</Message>
      </Response>`,
      {
        headers: {
          'Content-Type': 'application/xml'
        }
      }
    );
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}