import { NextResponse } from 'next/server';
import { makeVoiceCall } from '@/lib/twilio-service';

export async function POST(request: Request) {
  try {
    const { to, message, from } = await request.json();
    
    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await makeVoiceCall(to, message, from);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        callId: result.callId,
        message: 'Voice call initiated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to initiate voice call' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initiating voice call:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}