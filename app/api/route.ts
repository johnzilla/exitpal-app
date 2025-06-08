import { NextResponse } from 'next/server';

// Mock API route for handling webhooks from Twilio
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Webhook received:', data);
    
    // In a real app, we would validate the webhook and process the data
    
    return NextResponse.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}