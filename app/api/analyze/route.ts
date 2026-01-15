import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface Subscription {
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  transactions: Transaction[];
}

interface CategorySpending {
  category: string;
  total: number;
  percentage: number;
  count: number;
  transactions: Transaction[];
}

interface AnalysisResult {
  subscriptions: Subscription[];
  categorySpending: CategorySpending[];
  totalSpent: number;
  insights: {
    overview: string;
    insight: string;
    recommendation: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Add ANTHROPIC_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const { transactions }: { transactions: Transaction[] } = await request.json();

    if (!transactions || !transactions.length) {
      return NextResponse.json(
        { error: 'No transactions provided' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const analysis = await analyzeWithAI(anthropic, transactions);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze transactions' },
      { status: 500 }
    );
  }
}

async function analyzeWithAI(
  anthropic: Anthropic,
  transactions: Transaction[]
): Promise<AnalysisResult> {
  // Calculate total spent (debits only) - this is simple math, no AI needed
  const totalSpent = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Format transactions for AI analysis
  const transactionList = transactions
    .filter((t) => t.type === 'debit')
    .map((t, idx) => `${idx + 1}. ${t.date} | ${t.description} | ${t.amount.toFixed(2)}`)
    .join('\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are a personal finance analyst. Analyze these bank transactions and provide a comprehensive breakdown.

TRANSACTIONS (all debits/spending):
${transactionList}

TOTAL SPENT: ${totalSpent.toFixed(2)}

Analyze and return a JSON object with this EXACT structure:

{
  "subscriptions": [
    {
      "name": "Clean service name (e.g., 'Netflix', 'Spotify', 'Gym Membership')",
      "amount": average monthly amount as number,
      "frequency": "weekly" | "monthly" | "quarterly" | "annual" | "unknown",
      "confidence": "high" | "medium" | "low",
      "transactionIndices": [array of transaction numbers from the list above]
    }
  ],
  "categories": [
    {
      "category": "Category Name",
      "transactionIndices": [array of transaction numbers]
    }
  ],
  "insights": {
    "overview": "1-2 sentence summary of spending patterns",
    "insight": "1 notable observation about their spending (subscriptions, habits, etc.)",
    "recommendation": "1 specific, actionable tip to save money"
  }
}

SUBSCRIPTION DETECTION RULES:
- Look for recurring charges (same merchant, similar amounts appearing multiple times)
- Common subscriptions: streaming (Netflix, Spotify, Disney+, YouTube), software (Adobe, Microsoft), fitness (gyms, apps), utilities, insurance, phone plans
- Detect frequency by analyzing dates between similar transactions
- "high" confidence = exact same amount, clear pattern; "medium" = similar amounts; "low" = might be subscription
- Include the transaction indices that belong to each subscription

CATEGORY RULES - Use these categories:
- "Food & Dining" - restaurants, cafes, takeaway, groceries, supermarkets
- "Entertainment" - streaming, games, movies, events, hobbies
- "Shopping" - retail, online shopping, Amazon, clothing
- "Transportation" - fuel, parking, public transport, Uber/taxis, car expenses
- "Bills & Utilities" - phone, internet, electricity, water, council tax
- "Health & Fitness" - gym, pharmacy, medical, wellness
- "Software & Tech" - apps, subscriptions, software, domains
- "Insurance" - car, home, life, health insurance
- "Travel" - flights, hotels, holidays
- "Personal Care" - beauty, grooming, self-care
- "Education" - courses, books, training
- "Transfers & Payments" - bank transfers, credit card payments (if clearly visible)
- "Other" - anything that doesn't fit above

IMPORTANT:
- Every transaction should be assigned to exactly ONE category
- A transaction can be both in a subscription AND in a category
- Be conversational and friendly in insights, no finance jargon
- Return ONLY valid JSON, no markdown formatting`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  // Clean up response
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  try {
    const aiResult = JSON.parse(jsonText);
    
    // Get only debit transactions for mapping
    const debitTransactions = transactions.filter((t) => t.type === 'debit');

    // Map subscription indices back to actual transactions
    const subscriptions: Subscription[] = (aiResult.subscriptions || []).map((sub: any) => ({
      name: sub.name,
      amount: sub.amount,
      frequency: sub.frequency || 'monthly',
      confidence: sub.confidence || 'medium',
      transactions: (sub.transactionIndices || [])
        .map((idx: number) => debitTransactions[idx - 1])
        .filter(Boolean),
    }));

    // Map category indices back to actual transactions and calculate totals
    const categorySpending: CategorySpending[] = (aiResult.categories || []).map((cat: any) => {
      const catTransactions = (cat.transactionIndices || [])
        .map((idx: number) => debitTransactions[idx - 1])
        .filter(Boolean);
      
      const total = catTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      return {
        category: cat.category,
        total,
        percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
        count: catTransactions.length,
        transactions: catTransactions,
      };
    });

    // Sort categories by total spent (descending)
    categorySpending.sort((a, b) => b.total - a.total);

    // Filter out empty categories
    const filteredCategories = categorySpending.filter((cat) => cat.total > 0);

    return {
      subscriptions,
      categorySpending: filteredCategories,
      totalSpent,
      insights: aiResult.insights || {
        overview: 'Analysis complete.',
        insight: '',
        recommendation: '',
      },
    };
  } catch (parseError) {
    console.error('Failed to parse AI analysis response:', parseError);
    throw new Error('Failed to analyze transactions. Please try again.');
  }
}
