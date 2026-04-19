import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const MATCHES = [
  { id: 1, homeTeam: "Liverpool FC", awayTeam: "Arsenal FC", league: "Premier League", venue: "Anfield", date: "2025-04-26" },
  { id: 2, homeTeam: "Real Madrid", awayTeam: "FC Barcelona", league: "La Liga", venue: "Santiago Bernabeu", date: "2025-04-27" },
  { id: 3, homeTeam: "AC Milan", awayTeam: "Inter Milan", league: "Serie A", venue: "San Siro", date: "2025-04-28" },
  { id: 4, homeTeam: "Bayern Munich", awayTeam: "Borussia Dortmund", league: "Bundesliga", venue: "Allianz Arena", date: "2025-04-29" },
  { id: 5, homeTeam: "Chelsea FC", awayTeam: "Manchester City", league: "Premier League", venue: "Stamford Bridge", date: "2025-04-30" },
  { id: 6, homeTeam: "Paris Saint-Germain", awayTeam: "Marseille", league: "Ligue 1", venue: "Parc des Princes", date: "2025-05-01" },
];

const SYSTEM_PROMPT = `You are a football match prediction expert AI for PitchVision. When asked to predict a match, provide:
1. A predicted score (e.g., "2-1")
2. Win probability percentages (Home Win, Draw, Away Win) that sum to 100
3. Key tactical factors that will influence the match
4. One star player to watch from each team
5. A brief prediction rationale (2-3 sentences)

Format your response as JSON with this exact structure:
{
  "predictedScore": "2-1",
  "probabilities": { "homeWin": 45, "draw": 25, "awayWin": 30 },
  "homeKeyPlayer": "Player Name",
  "awayKeyPlayer": "Player Name",
  "tacticalFactors": ["factor 1", "factor 2", "factor 3"],
  "prediction": "Brief rationale here"
}

Be realistic with probabilities. Respond ONLY with valid JSON, no other text.`;

export async function GET() {
  return NextResponse.json({ success: true, matches: MATCHES });
}

export async function POST(request: NextRequest) {
  try {
    const { matchId, customPrompt } = await request.json();

    const match = MATCHES.find(m => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 400 });
    }

    const prompt = customPrompt || `Predict the upcoming match: ${match.homeTeam} vs ${match.awayTeam} (${match.league}) at ${match.venue} on ${match.date}. Provide detailed prediction with score, probabilities, key players, and tactical analysis.`;

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    const rawResponse = completion.choices[0]?.message?.content || '';

    // Try to parse JSON from the response
    let prediction;
    try {
      // Extract JSON from the response (may be wrapped in markdown code blocks)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        prediction = JSON.parse(rawResponse);
      }
    } catch {
      // If parsing fails, create a structured fallback
      prediction = {
        predictedScore: "1-1",
        probabilities: { homeWin: 35, draw: 30, awayWin: 35 },
        homeKeyPlayer: match.homeTeam.split(" ").pop(),
        awayKeyPlayer: match.awayTeam.split(" ").pop(),
        tacticalFactors: ["Both teams evenly matched", "Home advantage factor", "Recent form similar"],
        prediction: rawResponse || "Analysis inconclusive. Both teams have similar strength heading into this match."
      };
    }

    return NextResponse.json({
      success: true,
      match,
      prediction,
      rawAnalysis: rawResponse
    });
  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate prediction'
    }, { status: 500 });
  }
}
