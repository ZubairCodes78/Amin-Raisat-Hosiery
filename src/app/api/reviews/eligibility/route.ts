import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Reviews are now open to all visitors — no purchase or login required.
 * This endpoint always returns eligible: true.
 */
export async function GET(_req: Request) {
  return NextResponse.json({
    eligible: true,
    reason: 'Anyone can leave a review.',
  });
}
