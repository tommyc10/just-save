import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Add ANTHROPIC_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (max 5MB for CSV)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const csvText = await file.text();

    if (!csvText.trim()) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const transactions = await extractTransactionsWithAI(anthropic, csvText);

    if (!transactions.length) {
      return NextResponse.json(
        { error: 'No transactions found in CSV. Please ensure this is a valid bank statement.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse CSV file' },
      { status: 500 }
    );
  }
}

async function extractTransactionsWithAI(
  anthropic: Anthropic,
  csvText: string
): Promise<Transaction[]> {
  // Truncate if too long (keep first ~100KB to stay within token limits)
  const maxLength = 100000;
  const truncatedText = csvText.length > maxLength 
    ? csvText.substring(0, maxLength) + '\n... (truncated)'
    : csvText;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `You are a bank statement parser. Extract ALL transactions from this CSV bank statement.

IMPORTANT: Banks use many different CSV formats. You must intelligently identify:
- Which column contains the date (could be "Date", "Transaction Date", "Posted Date", "Value Date", etc.)
- Which column contains the description (could be "Description", "Memo", "Merchant", "Payee", "Details", "Narrative", etc.)
- Which column contains the amount (could be "Amount", "Debit", "Credit", "Withdrawal", "Deposit", separate debit/credit columns, etc.)
- Whether amounts are positive/negative, or if there are separate debit/credit columns

Return ONLY a valid JSON array with this exact structure:
[{"date": "the date as shown", "description": "merchant/payee name cleaned up", "amount": number, "type": "debit" or "credit"}]

RULES:
1. Extract EVERY transaction row - do not skip any
2. Amount should be a positive number
3. Type is "debit" for money spent/withdrawn/payments out, "credit" for money received/deposits/refunds
4. Clean up descriptions - remove excessive whitespace, reference numbers at the end, but keep the merchant name clear
5. Skip header rows, summary rows, balance rows - only actual transactions
6. If there are separate "Debit" and "Credit" columns, use whichever has a value
7. Handle different date formats gracefully
8. If a row doesn't look like a transaction (no amount, summary line, etc.), skip it

CSV Content:
${truncatedText}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  // Clean up response - remove markdown code blocks if present
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
    const transactions = JSON.parse(jsonText) as Transaction[];
    
    // Validate the structure
    return transactions.filter(
      (t) =>
        t &&
        typeof t.date === 'string' &&
        typeof t.description === 'string' &&
        typeof t.amount === 'number' &&
        !isNaN(t.amount) &&
        t.amount > 0 &&
        (t.type === 'debit' || t.type === 'credit')
    );
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    throw new Error('Failed to parse transactions from CSV. The file format may not be supported.');
  }
}
