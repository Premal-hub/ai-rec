import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin stats proxy error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
