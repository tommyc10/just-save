import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import path from 'path';
import { getAnthropicClient, getModelConfig } from '@/lib/ai/client';
import { extractJsonArray, parseTransactions } from '@/lib/ai/utils';
import { getPDFParsingPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const client = getAnthropicClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    PDFParse.setWorker(
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')
    );

    const parser = new PDFParse({ data: buffer, verbosity: 0, useSystemFonts: true });
    const { text } = await parser.getText();

    const transactions = await extractTransactionsWithAI(client, text);

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
      {
        error:
          error instanceof Error ? `Failed to parse PDF: ${error.message}` : 'Failed to parse PDF file',
      },
      { status: 500 }
    );
  }
}

async function extractTransactionsWithAI(
  client: ReturnType<typeof getAnthropicClient>,
  text: string
) {
  const message = await client.messages.create({
    ...getModelConfig(),
    messages: [
      {
        role: 'user',
        content: getPDFParsingPrompt(text),
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const jsonText = extractJsonArray(content.text);
    return parseTransactions(jsonText);
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError);
    throw new Error('Failed to extract transactions. Please try again.');
  }
}
