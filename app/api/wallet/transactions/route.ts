// API Route to fetch wallet transactions (lazy loading)
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.hyperfolio.xyz'
const API_KEY = process.env.HYPEREVM_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const page = searchParams.get('page') || '1'
    const offset = searchParams.get('offset') || '15'

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Fetch transactions from external API
    const response = await fetch(
      `${API_BASE_URL}/wallet/transactions?address=${address}&page=${page}&offset=${offset}`,
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

    return NextResponse.json({
      transactions: data.transactions || [],
      page: data.page || parseInt(page),
      offset: data.offset || parseInt(offset),
      total: data.total || 0,
      hasMore: data.hasMore || false,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}


