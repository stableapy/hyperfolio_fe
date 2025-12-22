import { NextRequest, NextResponse } from 'next/server'

// Use internal Docker URL for server-side calls (faster), fallback to public URL
const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.hyperfolio.xyz'
const API_KEY = process.env.HYPEREVM_API_KEY || ''

interface HistorySnapshot {
  total_value_usd: number
  snapshot_date: string
  snapshot_timestamp: number
}

interface PortfolioHistory {
  snapshots: HistorySnapshot[]
  summary: {
    current_value: number
    change_24h: number
    percent_change_24h: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { addresses } = body

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      )
    }

    // Fetch history for all addresses in parallel
    const historyPromises = addresses.map(async (address: string) => {
      try {
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
          console.warn(`Failed to fetch history for ${address}`)
          return null
        }

        const data: PortfolioHistory = await response.json()
        return data
      } catch (error) {
        console.warn(`Error fetching history for ${address}:`, error)
        return null
      }
    })

    const results = await Promise.all(historyPromises)
    const validHistories = results.filter((h): h is PortfolioHistory => h !== null)

    if (validHistories.length === 0) {
      return NextResponse.json(
        { error: 'No history data available for any wallet' },
        { status: 404 }
      )
    }

    // Aggregate snapshots by DATE
    // Step 1: For each wallet, get only ONE value per day (latest snapshot of that day)
    // Step 2: Sum values across all wallets for the same date
    
    // First, organize by wallet and date
    const walletDateMap = new Map<string, Map<string, HistorySnapshot>>()
    
    validHistories.forEach((history, walletIndex) => {
      const walletId = addresses[walletIndex]
      const dateMap = new Map<string, HistorySnapshot>()
      
      history.snapshots.forEach(snapshot => {
        const dateOnly = snapshot.snapshot_date.split('T')[0] // YYYY-MM-DD
        const existing = dateMap.get(dateOnly)
        
        // Keep only the LATEST snapshot for this wallet on this date
        if (!existing || snapshot.snapshot_timestamp > existing.snapshot_timestamp) {
          dateMap.set(dateOnly, snapshot)
        }
      })
      
      walletDateMap.set(walletId, dateMap)
    })

    // Now aggregate across wallets: sum one value per wallet per date
    const aggregatedMap = new Map<string, {
      date: string
      totalValue: number
      timestamp: number
    }>()

    // Get all unique dates
    const allDates = new Set<string>()
    walletDateMap.forEach(dateMap => {
      dateMap.forEach((_, date) => allDates.add(date))
    })

    // For each date, sum values from all wallets (one value per wallet max)
    allDates.forEach(date => {
      let totalValue = 0
      let earliestTimestamp = Infinity
      let sampleDate = ''

      walletDateMap.forEach(dateMap => {
        const snapshot = dateMap.get(date)
        if (snapshot) {
          totalValue += snapshot.total_value_usd
          earliestTimestamp = Math.min(earliestTimestamp, snapshot.snapshot_timestamp)
          sampleDate = snapshot.snapshot_date
        }
      })

      if (totalValue > 0) {
        aggregatedMap.set(date, {
          date: sampleDate,
          totalValue,
          timestamp: earliestTimestamp
        })
      }
    })

    // Convert map to sorted array
    const aggregatedSnapshots = Array.from(aggregatedMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date string
      .map(([, item]) => ({
        total_value_usd: item.totalValue,
        snapshot_date: item.date,
        snapshot_timestamp: item.timestamp
      }))

    // Calculate summary stats - this is naturally weighted since we're comparing
    // total portfolio values (sum of all wallets) at different times
    const currentValue = aggregatedSnapshots[aggregatedSnapshots.length - 1]?.total_value_usd || 0
    const previousValue = aggregatedSnapshots[aggregatedSnapshots.length - 2]?.total_value_usd || currentValue
    const change24h = currentValue - previousValue
    const percentChange24h = previousValue > 0 ? (change24h / previousValue) * 100 : 0

    const aggregatedHistory: PortfolioHistory = {
      snapshots: aggregatedSnapshots,
      summary: {
        current_value: currentValue,
        change_24h: change24h,
        percent_change_24h: percentChange24h
      }
    }

    return NextResponse.json(aggregatedHistory)
  } catch (error) {
    console.error('Error aggregating portfolio history:', error)
    return NextResponse.json(
      { error: 'Failed to aggregate portfolio history' },
      { status: 500 }
    )
  }
}

