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
    console.log('Starting GET /api/plans request');
    
    // Using a raw query for flexibility
    console.log('Executing database query...');
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
    console.log('Database query completed, rows count:', result.rows.length);

    // Log raw data for debugging
    console.log('Raw data from database:', JSON.stringify(result.rows, null, 2));

    // Ensure all date fields are properly serialized
    console.log('Starting data serialization...');
    const serializedRows = result.rows.map(row => {
      console.log('Processing row:', JSON.stringify(row, null, 2));
      
      const serializedRow = {
        ...row,
        submitDate: row.submitDate ? new Date(row.submitDate).toISOString().split('T')[0] : null,
        planDate: row.planDate ? new Date(row.planDate).toISOString().split('T')[0] : null
      };
      
      console.log('Serialized row:', JSON.stringify(serializedRow, null, 2));
      return serializedRow;
    });

    console.log('Final serialized data:', JSON.stringify(serializedRows, null, 2));
    return NextResponse.json(serializedRows);
  } catch (error: any) {
    console.error('Error in GET /api/plans:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    console.log('Starting POST /api/plans request');
    
    const { plan, totpToken } = await request.json();
    console.log('Received plan data:', JSON.stringify(plan, null, 2));

    // 验证 TOTP
    console.log('Validating TOTP token...');
    if (!totpToken || !validateTotp(totpToken, process.env.SUBMIT_TOTP_SECRET!)) {
      console.log('TOTP validation failed');
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }
    console.log('TOTP validation successful');

    // Validate required fields
    console.log('Validating required fields...');
    if (!plan.planDate || !plan.description) {
      console.log('Missing required fields:', { planDate: !!plan.planDate, description: !!plan.description });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Executing database insert...');
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
    console.log('Database insert completed, result:', JSON.stringify(result.rows[0], null, 2));

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/plans:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}