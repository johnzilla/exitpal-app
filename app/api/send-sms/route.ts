import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/twilio-service';

export async function POST(request: Request) {
  try {
    const { to, body, from } = await request.json();
    
    if (!to || !body) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await sendSMS(to, body, from);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'SMS sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to send SMS' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}