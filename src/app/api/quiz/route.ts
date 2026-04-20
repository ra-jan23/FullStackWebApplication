import { NextRequest, NextResponse } from 'next/server';
import { glmChatCompletion, isGLMConfigured } from '@/lib/glm';

const QUIZ_PROMPTS: Record<string, string> = {
  history: `Generate a football history quiz question. Focus on World Cup history, famous moments, legendary matches, football origins, and historic milestones.`,
  players: `Generate a quiz question about famous football players. Focus on career stats, records, achievements, playing style, and memorable performances.`,
  tactics: `Generate a quiz question about football tactics and formations. Focus on formations (4-3-3, 4-4-2, 3-5-2), pressing systems, positional play, and tactical innovations.`,
  clubs: `Generate a quiz question about football clubs. Focus on club history, major trophies, rivalries, iconic managers, and legendary eras.`,
  premier_league: `Generate a quiz question about the English Premier League. Focus on seasons, records, top scorers, title races, and iconic moments.`,
  champions_league: `Generate a quiz question about the UEFA Champions League. Focus on finals, records, legendary performances, and historic comebacks.`,
};

const SYSTEM_PROMPT = `You are a football quiz question generator. When given a category, generate exactly 1 quiz question in the following strict JSON format with NO additional text, NO markdown, NO code blocks:

{
  "question": "The question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of the correct answer with an interesting fact (1-2 sentences)",
  "difficulty": "easy" | "medium" | "hard",
  "category": "Category Name"
}

Rules:
- The correctAnswer is the 0-based index of the correct option (0, 1, 2, or 3)
- Mix difficulty levels - roughly 30% easy, 50% medium, 20% hard
- Make questions interesting and educational
- Include 4 plausible options where only one is clearly correct
- The explanation should teach something interesting
- Do NOT wrap the response in markdown code blocks
- Return ONLY valid JSON, nothing else`;

export async function POST(request: NextRequest) {
  try {
    const { category, count } = await request.json();

    const cat = category && QUIZ_PROMPTS[category] ? category : 'history';
    const num = typeof count === 'number' && count >= 1 && count <= 10 ? count : 5;

    if (isGLMConfigured()) {
      const prompt = `${QUIZ_PROMPTS[cat]}\n\nGenerate ${num} unique football quiz question(s). Return each question as a JSON array. If generating multiple, return a JSON array of question objects.`;

      const completion = await glmChatCompletion([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.8,
        maxTokens: 2048,
      });

      let responseText = completion.content || '';

      // Clean response - remove markdown code blocks if present
      responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

      // Try to parse as array
      let questions;
      try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) {
          questions = parsed;
        } else {
          questions = [parsed];
        }
      } catch {
        // Fallback: try to extract JSON from the response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          questions = generateFallbackQuestions(cat, num);
        }
      }

      // Validate and sanitize questions
      const validatedQuestions = questions.slice(0, num).map((q: any, i: number) => ({
        id: i + 1,
        question: typeof q.question === 'string' ? q.question : `Question ${i + 1}`,
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4 ? q.correctAnswer : 0,
        explanation: typeof q.explanation === 'string' ? q.explanation : 'Great question about football!',
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        category: cat,
      }));

      return NextResponse.json({
        success: true,
        questions: validatedQuestions,
        totalQuestions: validatedQuestions.length,
        category: cat,
        model: completion.model || 'GLM 4.5 Air',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'AI model not configured. Please set GLM_API_KEY in environment variables.',
      questions: generateFallbackQuestions('history', 5),
    }, { status: 500 });
  } catch (error: any) {
    console.error('Quiz API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate quiz',
      questions: generateFallbackQuestions('history', 5),
    }, { status: 500 });
  }
}

function generateFallbackQuestions(category: string, count: number) {
  const fallbacks: Record<string, any[]> = {
    history: [
      { question: "Which country hosted the first-ever FIFA World Cup in 1930?", options: ["Brazil", "Uruguay", "Argentina", "Italy"], correctAnswer: 1, explanation: "Uruguay hosted and won the first FIFA World Cup in 1930, defeating Argentina 4-2 in the final.", difficulty: "easy", category: "history" },
      { question: "Who is the all-time top scorer in FIFA World Cup history?", options: ["Pelé", "Ronaldo", "Miroslav Klose", "Just Fontaine"], correctAnswer: 2, explanation: "Germany's Miroslav Klose scored 16 goals across 4 World Cups (2002-2014), surpassing Ronaldo's 15.", difficulty: "easy", category: "history" },
      { question: "In which year was the FIFA World Cup first held in Asia?", options: ["1994", "1998", "2002", "2006"], correctAnswer: 2, explanation: "The 2002 World Cup was co-hosted by South Korea and Japan, the first tournament held in Asia.", difficulty: "medium", category: "history" },
      { question: "Which team won the first ever European Championship (Euro) in 1960?", options: ["West Germany", "Spain", "Soviet Union", "Yugoslavia"], correctAnswer: 2, explanation: "The Soviet Union won the inaugural European Nations' Cup, defeating Yugoslavia 2-1 in the final.", difficulty: "hard", category: "history" },
      { question: "Which player scored the 'Hand of God' goal in the 1986 World Cup?", options: ["Johan Cruyff", "Diego Maradona", "Zinedine Zidane", "Michel Platini"], correctAnswer: 1, explanation: "Diego Maradona scored both the 'Hand of God' and the 'Goal of the Century' against England in the 1986 quarter-final.", difficulty: "easy", category: "history" },
    ],
    players: [
      { question: "Which player has won the most Ballon d'Or awards?", options: ["Cristiano Ronaldo", "Lionel Messi", "Pelé", "Michel Platini"], correctAnswer: 1, explanation: "Lionel Messi has won a record 8 Ballon d'Or awards (2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023).", difficulty: "easy", category: "players" },
      { question: "Who is the only player to have scored in three different World Cup finals?", options: ["Pelé", "Miroslav Klose", "Kylian Mbappé", "Geoff Hurst"], correctAnswer: 2, explanation: "Kylian Mbappé scored in both the 2018 and 2022 World Cup finals, with 3 goals in the 2022 final alone.", difficulty: "medium", category: "players" },
      { question: "Which goalkeeper has the most clean sheets in Premier League history?", options: ["David Seaman", "Edwin van der Sar", "Petr Čech", "Joe Hart"], correctAnswer: 2, explanation: "Petr Čech holds the record with 202 Premier League clean sheets during his time at Chelsea and Arsenal.", difficulty: "medium", category: "players" },
      { question: "Who holds the record for most goals in a single Champions League season?", options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Ruud van Nistelrooy"], correctAnswer: 1, explanation: "Cristiano Ronaldo scored 17 goals in the 2013-14 Champions League season for Real Madrid.", difficulty: "hard", category: "players" },
      { question: "Which Brazilian legend is known as 'O Rei' (The King)?", options: ["Ronaldo", "Ronaldinho", "Pelé", "Zico"], correctAnswer: 2, explanation: "Pelé is widely known as 'O Rei' (The King) and is considered one of the greatest football players of all time.", difficulty: "easy", category: "players" },
    ],
    tactics: [
      { question: "Which formation is also known as the 'Christmas Tree'?", options: ["4-4-2", "4-3-2-1", "3-4-3", "5-3-2"], correctAnswer: 1, explanation: "The 4-3-2-1 is nicknamed the 'Christmas Tree' because the shape of the midfield and attack resembles a tree.", difficulty: "medium", category: "tactics" },
      { question: "Who is credited with inventing 'Total Football'?", options: ["Arrigo Sacchi", "Rinus Michels", "Vicente del Bosque", "Pep Guardiola"], correctAnswer: 1, explanation: "Dutch coach Rinus Michels developed Total Football at Ajax and the Netherlands national team in the 1970s.", difficulty: "medium", category: "tactics" },
      { question: "What does 'gegenpressing' mean?", options: ["Defensive deep block", "Immediate counter-pressing after losing the ball", "Long ball tactics", "Slow build-up play"], correctAnswer: 1, explanation: "Gegenpressing (counter-pressing) is a tactic where a team immediately presses the opponent after losing possession.", difficulty: "medium", category: "tactics" },
      { question: "Which manager popularized the 4-2-3-1 formation in modern football?", options: ["Arsène Wenger", "José Mourinho", "Carlo Ancelotti", "Jürgen Klopp"], correctAnswer: 1, explanation: "José Mourinho popularized the 4-2-3-1 during his Chelsea tenure, using it to win back-to-back Premier League titles.", difficulty: "hard", category: "tactics" },
      { question: "In a 3-5-2 formation, how many dedicated defenders are there?", options: ["2", "3", "4", "5"], correctAnswer: 1, explanation: "The 3-5-2 uses 3 center-backs, 5 midfielders (including wing-backs), and 2 strikers.", difficulty: "easy", category: "tactics" },
    ],
    clubs: [
      { question: "Which club has won the most UEFA Champions League titles?", options: ["AC Milan", "Bayern Munich", "Real Madrid", "Liverpool"], correctAnswer: 2, explanation: "Real Madrid holds the record with 15 Champions League/European Cup titles as of 2024.", difficulty: "easy", category: "clubs" },
      { question: "Which English club has gone the longest unbeaten top-flight run?", options: ["Manchester United", "Liverpool", "Chelsea", "Arsenal"], correctAnswer: 3, explanation: "Arsenal's 'Invincibles' went 49 Premier League games unbeaten during the 2003-04 season.", difficulty: "easy", category: "clubs" },
      { question: "Which club is known as 'La Vecchia Signora' (The Old Lady)?", options: ["AC Milan", "Inter Milan", "Juventus", "Roma"], correctAnswer: 2, explanation: "Juventus is nicknamed 'La Vecchia Signora' (The Old Lady), one of football's most famous club nicknames.", difficulty: "medium", category: "clubs" },
      { question: "How many consecutive league titles did Bayern Munich win from 2013 to 2023?", options: ["8", "9", "10", "11"], correctAnswer: 3, explanation: "Bayern Munich won an incredible 11 consecutive Bundesliga titles from 2013 to 2023.", difficulty: "medium", category: "clubs" },
      { question: "Which club plays its home matches at the Anfield stadium?", options: ["Everton", "Manchester City", "Liverpool", "Leeds United"], correctAnswer: 2, explanation: "Liverpool FC has played at Anfield since 1892. The stadium is famous for its 'You'll Never Walk Alone' anthem.", difficulty: "easy", category: "clubs" },
    ],
    premier_league: [
      { question: "Who was the first Premier League champion in 1992-93?", options: ["Manchester United", "Aston Villa", "Blackburn Rovers", "Liverpool"], correctAnswer: 0, explanation: "Manchester United won the inaugural Premier League title in 1992-93, ending a 26-year league title drought.", difficulty: "easy", category: "premier_league" },
      { question: "Which player scored 100 Premier League goals faster than anyone else?", options: ["Thierry Henry", "Alan Shearer", "Harry Kane", "Mohamed Salah"], correctAnswer: 1, explanation: "Alan Shearer reached 100 Premier League goals in just 124 appearances, a record that still stands.", difficulty: "medium", category: "premier_league" },
      { question: "In the 2015-16 season, which club achieved the most unlikely Premier League title win?", options: ["Tottenham Hotspur", "Leicester City", "West Ham United", "Southampton"], correctAnswer: 1, explanation: "Leicester City won the 2015-16 Premier League at 5000-1 odds, arguably the greatest underdog story in football history.", difficulty: "easy", category: "premier_league" },
      { question: "Who holds the record for most Premier League appearances?", options: ["James Milner", "Gareth Barry", "Frank Lampard", "Ryan Giggs"], correctAnswer: 1, explanation: "Gareth Barry made 653 Premier League appearances, the most of any player in the competition's history.", difficulty: "hard", category: "premier_league" },
      { question: "What is the largest ever Premier League victory margin?", options: ["8-0", "9-0", "10-0", "7-0"], correctAnswer: 1, explanation: "Manchester United 9-0 Ipswich Town (1995), Leicester 9-0 Southampton (2019), and Liverpool 9-0 Bournemouth (2022) share the record.", difficulty: "medium", category: "premier_league" },
    ],
    champions_league: [
      { question: "Which club achieved the 'Treble' (domestic league, domestic cup, Champions League) in 1999?", options: ["Barcelona", "Bayern Munich", "Manchester United", "Inter Milan"], correctAnswer: 2, explanation: "Manchester United won the Treble in 1998-99, with dramatic last-minute goals in the Champions League final against Bayern.", difficulty: "easy", category: "champions_league" },
      { question: "What was the biggest comeback in a Champions League knockout tie?", options: ["Barcelona 6-1 PSG", "Liverpool 4-0 Barcelona", "Real Madrid 3-1 Man City", "Bayern 8-2 Barcelona"], correctAnswer: 1, explanation: "Liverpool overturned a 3-0 first-leg deficit against Barcelona in the 2019 semi-final, winning 4-0 at Anfield.", difficulty: "medium", category: "champions_league" },
      { question: "Who scored the fastest hat-trick in Champions League history?", options: ["Lionel Messi", "Cristiano Ronaldo", "Bafétimbi Gomis", "Raúl González"], correctAnswer: 2, explanation: "Bafétimbi Gomis scored a hat-trick in 7 minutes for Lyon vs. Dinamo Zagreb in 2011.", difficulty: "hard", category: "champions_league" },
      { question: "Which player has scored in the most different Champions League matches?", options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Thomas Müller"], correctAnswer: 1, explanation: "Cristiano Ronaldo has scored in 67 different Champions League matches, a competition record.", difficulty: "medium", category: "champions_league" },
      { question: "Where was the first Champions League final held after the rebranding in 1992?", options: ["Rome", "Munich", "Wembley", "Vienna"], correctAnswer: 1, explanation: "The first Champions League final was held at the Olympiastadion in Munich in 1993, with Marseille beating AC Milan.", difficulty: "hard", category: "champions_league" },
    ],
  };

  return (fallbacks[category] || fallbacks.history).slice(0, count).map((q, i) => ({ ...q, id: i + 1 }));
}
