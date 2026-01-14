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

    const transactions = await extractTransactionsWithAI(text);

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
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Extract all transactions from this bank statement. Return ONLY a JSON array with this structure:
[{"date": "DD Mon YYYY", "description": "cleaned description", "amount": positive_number, "type": "debit" or "credit"}]

Rules: Skip balances, clean descriptions, extract debits and credits only.

${text}`
    }]
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  let jsonText = content.text.trim()
    .replace(/^```json\n/, '')
    .replace(/^```\n/, '')
    .replace(/\n```$/, '');

  return JSON.parse(jsonText) as Transaction[];
}
