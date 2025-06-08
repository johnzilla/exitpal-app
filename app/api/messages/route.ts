import { NextResponse } from 'next/server';
import { getMessagesByUserId } from '@/lib/message-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const messages = getMessagesByUserId(userId);
    
    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}