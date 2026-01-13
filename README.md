# AI Subscription & Spending Analyzer

Upload your bank statements and instantly see forgotten subscriptions and where your money actually goes each month — explained clearly by AI.

## Features

- **Privacy-First**: Files processed in browser, nothing stored on servers
- **No Login Required**: No account, no bank connection needed
- **Subscription Detection**: Automatically finds recurring charges
- **Spending Categories**: Smart categorization by industry (Food, Entertainment, etc.)
- **AI Insights**: Natural language explanations of your spending patterns powered by Claude

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Anthropic Claude API** - AI-powered insights
- **PapaParse** - CSV parsing
- **pdf-parse** - PDF parsing (coming soon)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up API Key

1. Get your Anthropic API key from [https://console.anthropic.com/](https://console.anthropic.com/)
2. Create a `.env.local` file in the root directory:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Try It Out

1. Upload the sample CSV file from `sample-data/bank-statement-sample.csv`
2. Or export your own bank statement as CSV
3. Click "Analyze Spending"

## File Format Requirements

### CSV Format

Your CSV should have these columns (names can vary):
- **Date**: Transaction date
- **Description**: Merchant/transaction description
- **Amount**: Transaction amount (negative for debits)

Example:
```csv
Date,Description,Amount
2024-01-05,Netflix Subscription,-15.99
2024-01-07,Starbucks Coffee,-5.75
```

### Supported Banks

Most banks let you export statements as CSV. Look for:
- "Export" or "Download" in your transaction history
- Choose CSV format
- Select last 2-3 months

## Project Structure

```
spending-analyzer/
├── app/
│   ├── page.tsx              # Main upload & results UI
│   ├── api/
│   │   └── explain/route.ts  # Claude AI endpoint
│   └── layout.tsx
├── lib/
│   ├── parsers.ts            # CSV/PDF parsing logic
│   └── analyzer.ts           # Subscription detection & categorization
├── sample-data/
│   └── bank-statement-sample.csv
└── .env.local.example
```

## How It Works

### 1. File Upload (app/page.tsx)
- Drag-and-drop or click to upload
- Validates CSV/PDF format
- Processes in browser (no server upload)

### 2. Parsing (lib/parsers.ts)
- Uses PapaParse for CSV
- Auto-detects column names (flexible format support)
- Normalizes data into standard Transaction format

### 3. Analysis (lib/analyzer.ts)
- **Subscription Detection**: Finds recurring charges with similar names/amounts
- **Categorization**: Matches descriptions against keyword lists
- **Statistics**: Calculates totals, averages, percentages

### 4. AI Insights (app/api/explain/route.ts)
- Sends analysis summary to Claude API
- Generates natural language explanation
- Returns actionable recommendations

## Customization Ideas

### Add More Categories
Edit `CATEGORY_KEYWORDS` in `lib/analyzer.ts`:

```typescript
const CATEGORY_KEYWORDS = {
  'Your Category': ['keyword1', 'keyword2'],
  // ...
};
```

### Improve Subscription Detection
Add keywords to `SUBSCRIPTION_KEYWORDS` in `lib/analyzer.ts`:

```typescript
const SUBSCRIPTION_KEYWORDS = [
  'your-service',
  // ...
];
```

### Customize AI Prompt
Edit the `buildPrompt` function in `app/api/explain/route.ts` to change how Claude analyzes data.

## Learning Notes

### Key Concepts Covered

1. **File Upload in React**
   - HTML5 drag-and-drop API
   - Hidden file input pattern
   - FileReader API for browser-side parsing

2. **Next.js App Router**
   - Server Components vs Client Components ('use client')
   - API Routes (route handlers)
   - Environment variables

3. **Type Safety with TypeScript**
   - Interface definitions
   - Type inference
   - Generic types

4. **API Integration**
   - Anthropic SDK usage
   - Async/await patterns
   - Error handling

5. **Tailwind CSS**
   - Utility classes
   - Responsive design
   - Conditional styling

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

Make sure to add `ANTHROPIC_API_KEY` in Vercel environment variables.

### Other Platforms

Works on any Node.js hosting:
- Netlify
- Railway
- DigitalOcean App Platform

## Privacy & Security

- ✓ Files never leave the browser (parsed client-side)
- ✓ Only analysis summary sent to API (not raw transactions)
- ✓ No database or file storage
- ✓ No authentication required
- ✓ API key secured server-side

## Future Enhancements

- [ ] PDF parsing support
- [ ] Multi-month trend analysis
- [ ] Export analysis as PDF report
- [ ] Compare spending month-over-month
- [ ] Set budget goals and alerts
- [ ] Dark mode

## Credits

Inspired by [JustCancel.io](https://www.justcancel.io)
