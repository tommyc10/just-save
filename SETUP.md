# Quick Setup Guide

Follow these steps to get your AI Spending Analyzer running with Claude AI.

## Step 1: Get Your Anthropic API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up for an account (if you don't have one)
3. Navigate to "API Keys" in the dashboard
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)

**Note**: You'll need to add credits to your account. Anthropic offers $5 free credit for new users.

## Step 2: Create Environment File

In the root of your project (`spending-analyzer/`), create a file called `.env.local`:

```bash
# In the terminal, run:
touch .env.local
```

Or create it manually in your code editor.

## Step 3: Add Your API Key

Open `.env.local` and add this line (replace with your actual key):

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**Important**:
- No quotes needed
- No spaces around the `=`
- Make sure the file is named exactly `.env.local`

## Step 4: Restart the Dev Server

If the dev server is already running, restart it:

```bash
# Stop the server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

## Step 5: Test It Out

1. Open [http://localhost:3001](http://localhost:3001)
2. Upload the sample CSV: `sample-data/bank-statement-sample.csv`
3. Click "Analyze Spending"
4. Wait a few seconds for the AI insights to appear

## Troubleshooting

### Error: "API key not configured"
- Check that `.env.local` exists in the root directory
- Verify the API key starts with `sk-ant-`
- Restart the dev server

### Error: "Failed to generate explanation"
- Check your Anthropic account has credits
- Verify your API key is valid
- Check the browser console for more details (F12 → Console tab)

### CSV Upload Not Working
- Make sure your CSV has columns: Date, Description, Amount
- Check that amounts are negative for expenses (e.g., -15.99)
- Try the sample CSV first to verify it works

## Understanding the Code Flow

When you click "Analyze Spending":

1. **Browser parses CSV** → `lib/parsers.ts` (no server involved)
2. **Browser analyzes transactions** → `lib/analyzer.ts`
   - Detects subscriptions
   - Categorizes spending
3. **Browser calls API** → `app/api/explain/route.ts`
   - Sends analysis summary (NOT raw transactions)
   - Claude generates insights
4. **Display results** → `app/page.tsx`

## Cost Estimate

Claude API costs are low for this use case:
- ~500 tokens per request
- Claude 3.5 Sonnet: $3 per million input tokens
- Cost per analysis: **~$0.0015** (less than 1 cent)

## Next Steps

Want to customize it? Check out:
- `lib/analyzer.ts` - Add more subscription keywords or categories
- `app/api/explain/route.ts` - Customize the AI prompt
- `app/page.tsx` - Modify the UI design

Enjoy building!
