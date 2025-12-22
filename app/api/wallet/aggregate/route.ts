// API Route to fetch aggregate multi-wallet data
import { NextRequest, NextResponse } from 'next/server'

import { getMultiWalletData } from '@/lib/api/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { addresses, cache } = body
    
    // cache=false means skip cache
    const skipCache = cache === false

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ error: 'Addresses array is required' }, { status: 400 })
    }

    const data = await getMultiWalletData(addresses, skipCache)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching aggregate wallet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aggregate wallet data' },
      { status: 500 }
    )
  }
}

