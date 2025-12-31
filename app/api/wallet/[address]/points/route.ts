// API Route to fetch points for a wallet
import { NextRequest, NextResponse } from 'next/server';

import { getDefiPoints } from '@/lib/api/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Check for cache bypass parameter
    const { searchParams } = new URL(request.url);
    const skipCache = searchParams.get('cache') === 'false';

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const response = await getDefiPoints(address, skipCache);

    return NextResponse.json({
      data: response.data,
      cache: response.cache,
    });
  } catch (error) {
    console.error('Error fetching points data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points data' },
      { status: 500 }
    );
  }
}
