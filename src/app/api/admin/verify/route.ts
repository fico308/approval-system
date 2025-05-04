import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';

// POST /api/admin/verify - Verify admin TOTP token
export async function POST(request: NextRequest) {
  try {
    const { totpToken } = await request.json();

    // 验证 TOTP
    const isValid = authenticator.verify({
      token: totpToken,
      secret: process.env.ADMIN_TOTP_SECRET!
    });

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying admin TOTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify TOTP' },
      { status: 500 }
    );
  }
} 