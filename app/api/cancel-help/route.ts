import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, getModelConfig } from '@/lib/ai/client';
import { cleanJsonResponse } from '@/lib/ai/utils';
import { getCancelHelpPrompt } from '@/lib/prompts';
import type { CancelHelp } from '@/lib/types';

interface CancelHelpRequest {
  name: string;
  amount: number;
  frequency: string;
  knownUrl?: string;
  knownGotcha?: string;
}

export async function POST(request: NextRequest) {
  try {
    const client = getAnthropicClient();
    const body = (await request.json()) as CancelHelpRequest;

    if (!body.name || typeof body.amount !== 'number' || !body.frequency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await client.messages.create({
      ...getModelConfig(),
      messages: [{ role: 'user', content: getCancelHelpPrompt(body) }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    const parsed = JSON.parse(cleanJsonResponse(content.text)) as CancelHelp;

    if (!Array.isArray(parsed.steps) || !Array.isArray(parsed.gotchas)) {
      throw new Error('AI returned malformed cancellation help');
    }

    return NextResponse.json({ help: parsed });
  } catch (error) {
    console.error('Error generating cancel help:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate cancellation help' },
      { status: 500 }
    );
  }
}
