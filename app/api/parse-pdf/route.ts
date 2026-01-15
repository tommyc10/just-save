import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    PDFParse.setWorker(path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'));

    const parser = new PDFParse({ data: buffer, verbosity: 0, useSystemFonts: true });
    const { text } = await parser.getText();

    // Debug: Log the extracted text to see what we're working with
    console.log('=== PDF TEXT EXTRACTED ===');
    console.log('Text length:', text.length);
    console.log('First 2000 chars:', text.substring(0, 2000));
    console.log('=== END PDF TEXT ===');

    const transactions = await extractTransactionsWithAI(text);

    // Debug: Log what Claude extracted
    console.log('=== TRANSACTIONS EXTRACTED ===');
    console.log('Count:', transactions.length);
    console.log('Total (debits only):', transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0));
    console.log('Transactions:', JSON.stringify(transactions, null, 2));
    console.log('=== END TRANSACTIONS ===');

    if (!transactions.length) {
      return NextResponse.json(
        { error: 'No transactions found in PDF. Please ensure this is a valid bank statement.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? `Failed to parse PDF: ${error.message}` : 'Failed to parse PDF file' },
      { status: 500 }
    );
  }
}

async function extractTransactionsWithAI(text: string): Promise<Transaction[]> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `Extract ALL transactions from this credit card statement as a JSON array.

RESPOND WITH ONLY A JSON ARRAY - NO OTHER TEXT.

Format: [{"date": "DD Mon YYYY", "description": "merchant name", "amount": number, "type": "debit" or "credit"}]

Rules:
- Transaction lines look like: "Oct 20 Oct 20 DELIVEROO LONDON" followed by amounts in a separate column
- Match each transaction description to its amount BY POSITION (1st transaction = 1st amount)
- Amount must be a positive number
- Type is "debit" for purchases, "credit" for refunds (marked CR)
- SKIP summary lines like "Total new spend transactions"
- Use GBP amounts only

Statement:
${text}

RESPOND WITH ONLY THE JSON ARRAY, NOTHING ELSE:`
    }]
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  let jsonText = content.text.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();
  
  // Try to find JSON array in the response if it's not pure JSON
  if (!jsonText.startsWith('[')) {
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    } else {
      console.error('AI response was not JSON:', jsonText.substring(0, 500));
      throw new Error('Failed to extract transactions. Please try again.');
    }
  }

  try {
    const transactions = JSON.parse(jsonText) as Transaction[];
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
    console.error('Failed to parse JSON:', parseError, 'Text:', jsonText.substring(0, 500));
    throw new Error('Failed to parse transactions. Please try again.');
  }
}
