import { NextResponse } from 'next/server';

/**
 * Health check endpoint for zero-downtime deployments
 * Used by Docker HEALTHCHECK and Coolify to verify container readiness
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}







