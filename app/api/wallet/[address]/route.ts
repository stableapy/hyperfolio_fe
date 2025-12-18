// API Route to fetch individual wallet data
import { NextRequest, NextResponse } from 'next/server'

import { getWalletData } from '@/lib/api/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const data = await getWalletData(address)

    // Return data with compositionRaw as composition for compatibility
    return NextResponse.json({
      ...data,
      composition: data.compositionRaw, // Return raw data for frontend use
    })
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}

