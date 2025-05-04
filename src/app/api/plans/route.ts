import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { Plan } from '@/types/plans';
import { authenticator } from 'otplib';

// 验证 TOTP
function validateTotp(token: string, secret: string) {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP validation error:', error);
    return false;
  }
}

// GET /api/plans - Get all plans
export async function GET(request: NextRequest) {
  try {
    // Using a raw query for flexibility
    const result = await db.query(`
      SELECT 
        id,
        submit_date as "submitDate",
        plan_date as "planDate",
        description,
        alternative,
        status,
        feedback
      FROM plans
      ORDER BY submit_date DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    const { plan, totpToken } = await request.json();

    // 验证 TOTP
    if (!totpToken || !validateTotp(totpToken, process.env.SUBMIT_TOTP_SECRET!)) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!plan.planDate || !plan.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      INSERT INTO plans (
        id, 
        submit_date, 
        plan_date, 
        description, 
        alternative, 
        status, 
        feedback
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        submit_date as "submitDate",
        plan_date as "planDate",
        description,
        alternative,
        status,
        feedback
      `,
      [
        plan.id,
        plan.submitDate,
        plan.planDate,
        plan.description,
        plan.alternative || '',
        'pending',
        ''
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}