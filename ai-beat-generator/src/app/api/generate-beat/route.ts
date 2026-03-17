import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, bpm, mood, bars } = body;

    // Validate inputs
    if (!genre || !bpm || !mood || !bars) {
      return NextResponse.json(
        { error: 'Missing required fields: genre, bpm, mood, bars' },
        { status: 400 }
      );
    }

    if (bpm < 60 || bpm > 200) {
      return NextResponse.json(
        { error: 'BPM must be between 60 and 200' },
        { status: 400 }
      );
    }

    if (![4, 8, 16].includes(bars)) {
      return NextResponse.json(
        { error: 'Bars must be 4, 8, or 16' },
        { status: 400 }
      );
    }

    // For MVP, return a mock response
    // In production, this would call a Python/FastAPI AI service
    const beat_id = `beat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    return NextResponse.json({
      beat_id,
      audio_url: `/api/beats/${beat_id}/audio`,
      metadata: {
        genre,
        bpm,
        mood,
        bars,
        generated_at: new Date().toISOString(),
        format: 'wav',
        note: 'MVP: Audio is generated client-side using Web Audio API. This endpoint validates parameters and returns a beat ID for future backend AI integration.'
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
