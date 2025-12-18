import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.hyperfolio.xyz'
const API_KEY = process.env.HYPEREVM_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${API_BASE_URL}/portfolio-history?address=${address}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching portfolio history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio history' },
      { status: 500 }
    )
  }
}


