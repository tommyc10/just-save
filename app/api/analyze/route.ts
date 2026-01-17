import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, getModelConfig } from '@/lib/ai/client';
import { cleanJsonResponse } from '@/lib/ai/utils';
import { getAnalysisPrompt } from '@/lib/prompts';
import type { Transaction, Subscription, CategorySpending, Analysis } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const client = getAnthropicClient();

    const { transactions }: { transactions: Transaction[] } = await request.json();

    if (!transactions || !transactions.length) {
      return NextResponse.json({ error: 'No transactions provided' }, { status: 400 });
    }

    const analysis = await analyzeWithAI(client, transactions);

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
  client: ReturnType<typeof getAnthropicClient>,
  transactions: Transaction[]
): Promise<Analysis> {
  // Calculate total spent (debits only)
  const debitTransactions = transactions.filter((t) => t.type === 'debit');
  const totalSpent = debitTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Format transactions for AI analysis
  const transactionList = debitTransactions
    .map((t, idx) => `${idx + 1}. ${t.date} | ${t.description} | ${t.amount.toFixed(2)}`)
    .join('\n');

  const message = await client.messages.create({
    ...getModelConfig(),
    messages: [
      {
        role: 'user',
        content: getAnalysisPrompt(transactionList, totalSpent),
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  const jsonText = cleanJsonResponse(content.text);

  try {
    const aiResult = JSON.parse(jsonText);

    // Map subscription indices back to actual transactions
    const subscriptions: Subscription[] = (aiResult.subscriptions || []).map(
      (sub: { name: string; amount: number; frequency?: string; confidence?: string; transactionIndices?: number[] }) => ({
        name: sub.name,
        amount: sub.amount,
        frequency: sub.frequency || 'monthly',
        confidence: sub.confidence || 'medium',
        transactions: (sub.transactionIndices || [])
          .map((idx: number) => debitTransactions[idx - 1])
          .filter(Boolean),
      })
    );

    // Map category indices back to actual transactions and calculate totals
    const categorySpending: CategorySpending[] = (aiResult.categories || []).map(
      (cat: { category: string; transactionIndices?: number[] }) => {
        const catTransactions = (cat.transactionIndices || [])
          .map((idx: number) => debitTransactions[idx - 1])
          .filter(Boolean);

        const total = catTransactions.reduce(
          (sum: number, t: Transaction) => sum + t.amount,
          0
        );

        return {
          category: cat.category,
          total,
          percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
          count: catTransactions.length,
          transactions: catTransactions,
        };
      }
    );

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
