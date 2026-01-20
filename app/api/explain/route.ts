import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { Analysis } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const { analysis }: { analysis: Analysis } = await request.json();

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Add ANTHROPIC_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Create prompt for Claude
    const prompt = buildPrompt(analysis);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text response
    const textContent = message.content.find((block) => block.type === 'text');
    const explanation = textContent && 'text' in textContent ? textContent.text : '';

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
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

  return `You are a personal finance advisor. Analyze this spending data and provide clear, actionable insights in 3-4 short paragraphs.

Total Spent: $${totalSpent.toFixed(2)}

Subscriptions Found (${subscriptions.length}):
${subsList || 'None detected'}

Spending by Category:
${categoryList}

Please provide:
1. A summary of their spending patterns (1-2 sentences)
2. Notable insights about subscriptions or categories (1-2 sentences)
3. One specific, actionable recommendation to save money (1-2 sentences)

Keep it conversational, friendly, and avoid finance jargon. Focus on what's interesting or surprising about their spending.`;
}
