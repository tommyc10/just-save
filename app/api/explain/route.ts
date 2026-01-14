import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Analysis } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const { analysis }: { analysis: Analysis } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Add ANTHROPIC_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(analysis) }],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    let rawText = textContent && 'text' in textContent ? textContent.text : '{}';
    
    // Clean up the response - remove markdown code blocks if present
    rawText = rawText.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.slice(7);
    } else if (rawText.startsWith('```')) {
      rawText = rawText.slice(3);
    }
    if (rawText.endsWith('```')) {
      rawText = rawText.slice(0, -3);
    }
    rawText = rawText.trim();
    
    // Parse the JSON response
    try {
      const insights = JSON.parse(rawText);
      return NextResponse.json({ insights });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', rawText);
      // Fallback if JSON parsing fails
      return NextResponse.json({ 
        insights: { 
          overview: rawText, 
          insight: '', 
          recommendation: '' 
        } 
      });
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

/**
 * Build the prompt for Claude to generate insights
 */
function buildPrompt(analysis: Analysis): string {
  const { subscriptions, categorySpending, totalSpent } = analysis;

  // Format subscriptions list
  const subsList = subscriptions
    .map((sub) => `- ${sub.name}: $${sub.amount.toFixed(2)}/month`)
    .join('\n');

  // Format category spending
  const categoryList = categorySpending
    .map(
      (cat) =>
        `- ${cat.category}: $${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%)`
    )
    .join('\n');

  return `You are a personal finance advisor. Analyze this spending data and provide clear, actionable insights.

Total Spent: $${totalSpent.toFixed(2)}

Subscriptions Found (${subscriptions.length}):
${subsList || 'None detected'}

Spending by Category:
${categoryList}

Respond with valid JSON only, no markdown, in this exact format:
{
  "overview": "1-2 sentence summary of their spending patterns",
  "insight": "1-2 sentence notable insight about subscriptions or categories", 
  "recommendation": "One specific, actionable tip to save money"
}

Keep it conversational and friendly. No finance jargon.`;
}
