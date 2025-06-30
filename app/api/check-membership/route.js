import { NextResponse } from 'next/server';
import { checkMembershipAvailability, addToWaitlist } from '@/lib/rateLimiter';

export async function GET(request) {
  try {
    const membershipStatus = await checkMembershipAvailability();
    return NextResponse.json(membershipStatus);
  } catch (error) {
    console.error('Error checking membership:', error);
    return NextResponse.json(
      { error: 'Failed to check membership status' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { email, name } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }
    
    await addToWaitlist(email, name);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully added to waitlist' 
    });
    
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}