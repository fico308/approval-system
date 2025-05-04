import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { PlanUpdateInput } from '@/types/plans';
import { authenticator } from 'otplib';

// 验证 TOTP
function validateTotp(token: string, secret: string) {
  try {
    console.log('Validating TOTP:', {
      token,
      secret,
      adminSecret: process.env.ADMIN_TOTP_SECRET
    });
    
    const isValid = authenticator.verify({ token, secret });
    console.log('TOTP validation result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('TOTP validation error:', error);
    return false;
  }
}

// PUT /api/plans/:id - Update a plan's status and feedback
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const { status, feedback, totpToken } = await request.json();
    
    // 验证 TOTP
    if (!totpToken || !validateTotp(totpToken, process.env.ADMIN_TOTP_SECRET!)) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Validate the update
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      UPDATE plans
      SET status = $1, feedback = $2
      WHERE id = $3
      RETURNING 
        id,
        submit_date as "submitDate",
        plan_date as "planDate",
        description,
        alternative,
        status,
        feedback
      `,
      [status, feedback, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}