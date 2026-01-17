import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, getModelConfig } from '@/lib/ai/client';
import { extractJsonArray, parseTransactions } from '@/lib/ai/utils';
import { getCSVParsingPrompt } from '@/lib/prompts';
import { FILE_LIMITS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const client = getAnthropicClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > FILE_LIMITS.MAX_CSV_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const csvText = await file.text();

    if (!csvText.trim()) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const transactions = await extractTransactionsWithAI(client, csvText);

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
  client: ReturnType<typeof getAnthropicClient>,
  csvText: string
) {
  const truncatedText =
    csvText.length > FILE_LIMITS.MAX_TEXT_LENGTH
      ? csvText.substring(0, FILE_LIMITS.MAX_TEXT_LENGTH) + '\n... (truncated)'
      : csvText;

  const message = await client.messages.create({
    ...getModelConfig(),
    messages: [
      {
        role: 'user',
        content: getCSVParsingPrompt(truncatedText),
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  try {
    const jsonText = extractJsonArray(content.text);
    return parseTransactions(jsonText);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    throw new Error('Failed to parse transactions from CSV. The file format may not be supported.');
  }
}
