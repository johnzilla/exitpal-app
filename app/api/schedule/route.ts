import { NextResponse } from 'next/server';
import { scheduleMessage } from '@/lib/message-service';

export async function POST(request: Request) {
  try {
    const messageData = await request.json();
    
    // Validate required fields
    if (!messageData.userId || !messageData.contactName || !messageData.messageContent || 
        !messageData.phoneNumber || !messageData.scheduledTime || !messageData.messageType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await scheduleMessage({
      userId: messageData.userId,
      contactName: messageData.contactName,
      messageContent: messageData.messageContent,
      phoneNumber: messageData.phoneNumber,
      scheduledTime: new Date(messageData.scheduledTime),
      messageType: messageData.messageType,
      status: 'pending'
    });
    
    return NextResponse.json({
      success: true,
      messageId: result.id,
      message: 'Message scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling message:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}