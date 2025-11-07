import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const payload = verifyJwt(token);
    
    if (!payload) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, payload });
  } catch (error) {
    console.error('JWT verification API error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

