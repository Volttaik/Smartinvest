import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const symbols = 'TSLA,AAPL,MSFT,GOOGL,NVDA,AMZN,GC=F,SI=F,CL=F';
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,shortName`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Yahoo Finance unavailable');
    const json = await res.json();
    const quotes = json?.quoteResponse?.result || [];
    const result: Record<string, { price: number; change: number; name: string }> = {};
    for (const q of quotes) {
      result[q.symbol] = {
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChangePercent ?? 0,
        name: q.shortName || q.symbol,
      };
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      'TSLA':  { price: 248.50,  change: 1.8,  name: 'Tesla Inc.' },
      'AAPL':  { price: 213.40,  change: 0.6,  name: 'Apple Inc.' },
      'MSFT':  { price: 415.20,  change: 0.4,  name: 'Microsoft' },
      'GOOGL': { price: 175.80,  change: -0.3, name: 'Alphabet Inc.' },
      'NVDA':  { price: 875.30,  change: 2.1,  name: 'NVIDIA Corp.' },
      'AMZN':  { price: 192.60,  change: 0.9,  name: 'Amazon.com' },
      'GC=F':  { price: 3250.40, change: 0.5,  name: 'Gold Futures' },
      'SI=F':  { price: 33.20,   change: -0.2, name: 'Silver Futures' },
      'CL=F':  { price: 71.80,   change: -1.1, name: 'Crude Oil' },
    });
  }
}
