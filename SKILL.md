# Just Save - Spending Analyzer Skill

## Project Overview

Just Save is a privacy-focused financial analysis tool that helps users identify forgotten subscriptions and analyze spending patterns. Built with Next.js 16, React 19, and powered by Claude AI for intelligent transaction parsing and categorization.

**Key Features:**
- AI-powered CSV/PDF bank statement parsing
- Subscription detection and categorization
- Interactive spending visualization with donut charts
- Dark/light theme support with system preference detection
- Zero-storage architecture (client-side processing only)

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router, Turbopack)
- **UI:** React 19.2.3, TypeScript 5, Tailwind CSS v4
- **Animation:** Framer Motion 12.26.2
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **PDF Processing:** pdf-parse
- **State Management:** React useReducer pattern

## Project Architecture

```
spending-analyzer/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main app (upload/results view)
│   ├── layout.tsx         # Root layout with ThemeProvider
│   ├── globals.css        # Global styles with CSS variables
│   └── api/               # API routes
│       ├── parse-csv/     # CSV parsing endpoint
│       ├── parse-pdf/     # PDF parsing endpoint
│       └── analyze/       # Transaction analysis endpoint
├── components/            # React components
│   ├── UploadView.tsx    # File upload interface
│   ├── ResultsView.tsx   # Analysis results display
│   ├── ThemeToggle.tsx   # Dark mode toggle
│   ├── SpendingDonutChart.tsx  # Interactive chart
│   ├── ProgressIndicator.tsx   # Multi-step progress
│   ├── CategoryBreakdown.tsx   # Category details
│   └── AIInsights.tsx    # AI-generated insights
├── contexts/
│   └── ThemeContext.tsx  # Theme state management
├── hooks/
│   └── useFileAnalysis.ts  # File analysis logic
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # Configuration constants
│   ├── prompts.ts        # AI prompt templates
│   ├── parsers.ts        # CSV/PDF parsing utilities
│   ├── analyzer.ts       # Transaction analysis
│   └── ai/
│       ├── client.ts     # Anthropic client singleton
│       └── utils.ts      # AI response parsing
└── public/               # Static assets
```

## Code Style & Conventions

### TypeScript
- All components use TypeScript with strict type checking
- Types are centralized in `lib/types.ts`
- Interfaces prefixed with component name (e.g., `ResultsViewProps`)
- Use `type` for unions, `interface` for object shapes

### React Patterns
- **Client Components:** All interactive components use `'use client'` directive
- **State Management:** Use `useReducer` for complex state (see `useFileAnalysis.ts`)
- **Hooks:** Custom hooks in `/hooks` directory
- **Server Components:** API routes are server-side only

### Styling
- **Tailwind CSS v4** with CSS variables for theming
- **CSS Variables:** Defined in `globals.css` for light/dark mode
  - `--background`, `--foreground`, `--muted`, `--border`, `--card`, `--accent`
- **Color Classes:** Use semantic classes: `bg-background`, `text-foreground`, `text-muted-foreground`
- **Dark Mode:** Toggle via `ThemeContext`, persists to localStorage

### Animation
- **Framer Motion** for all animations
- **Timing Constants:** Defined in `lib/constants.ts` (ANIMATION_TIMINGS)
- **Patterns:**
  - Counter animations: `useMotionValue` + `useTransform`
  - Staggered reveals: `initial/animate/transition` with delays
  - SVG animations: `strokeDasharray` for donut chart

### AI Integration
- **Model:** claude-sonnet-4-20250514
- **Prompts:** Centralized in `lib/prompts.ts`
- **Client:** Singleton in `lib/ai/client.ts`
- **Response Parsing:** JSON extraction with retry logic in `lib/ai/utils.ts`
- **Error Handling:** Graceful degradation, user-friendly error messages

## File Handling

### CSV Parsing
- Reads file as text, sends to Claude for AI-powered parsing
- No hardcoded column detection - fully AI-driven
- Returns array of `Transaction` objects

### PDF Parsing
- Uses `pdf-parse` to extract text
- Claude analyzes unstructured text to identify transactions
- Handles various bank statement formats

### Analysis Flow
1. **Upload:** User drops/selects CSV or PDF
2. **Parse:** File sent to appropriate API route
3. **Analyze:** Transactions sent to `/api/analyze`
4. **Display:** Results shown with animations and AI insights

## State Management

### useFileAnalysis Hook (useReducer)
```typescript
State: {
  file: File | null
  isDragging: boolean
  isAnalyzing: boolean
  analysisStep: 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete'
  analysis: Analysis | null
  insights: AIInsights | null
  error: string
}

Actions:
- SET_DRAGGING
- SET_FILE
- CLEAR_FILE
- START_ANALYSIS
- SET_STEP
- ANALYSIS_SUCCESS
- ANALYSIS_ERROR
- RESET
```

### Theme Management (Context)
```typescript
ThemeContext provides:
- theme: 'light' | 'dark' | 'system'
- resolvedTheme: 'light' | 'dark'
- setTheme: (theme: Theme) => void

Features:
- System preference detection
- localStorage persistence
- Flash prevention script in layout.tsx
```

## API Routes

### POST /api/parse-csv
- **Input:** FormData with CSV file
- **Output:** `{ transactions: Transaction[] }`
- **Process:** AI-powered CSV parsing

### POST /api/parse-pdf
- **Input:** FormData with PDF file
- **Output:** `{ transactions: Transaction[] }`
- **Process:** pdf-parse → AI extraction

### POST /api/analyze
- **Input:** `{ transactions: Transaction[] }`
- **Output:** `{ analysis: Analysis }`
- **Process:** AI categorization, subscription detection, insights generation

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-... # Required for all AI features
```

## Common Tasks

### Adding a New Page
1. Create in `app/[route]/page.tsx`
2. Import `ThemeToggle` component
3. Use semantic color classes (`bg-background`, `text-foreground`)
4. Add footer navigation with links
5. Ensure relative positioning for theme toggle

### Modifying AI Prompts
1. Edit `lib/prompts.ts`
2. Test with various statement formats
3. Ensure JSON response format is maintained
4. Update type definitions in `lib/types.ts` if schema changes

### Adding Animation
1. Import from `framer-motion`
2. Use constants from `lib/constants.ts` (ANIMATION_TIMINGS)
3. Follow existing patterns (see `ResultsView.tsx`, `SpendingDonutChart.tsx`)

### Updating Theme Colors
1. Edit CSS variables in `app/globals.css`
2. Update both `:root` (light) and `.dark` sections
3. Use `@theme inline` for Tailwind integration

## Testing Checklist

- [ ] Upload CSV file (various formats)
- [ ] Upload PDF file (various bank statements)
- [ ] Theme toggle works on all pages
- [ ] Progress indicator shows all steps
- [ ] Donut chart animates and responds to hover/click
- [ ] Dark mode persists on refresh
- [ ] Mobile responsive design
- [ ] Error handling for invalid files

## Performance Considerations

- **File Size Limits:** Enforced in `lib/constants.ts` (FILE_LIMITS)
- **AI Response Time:** ~10-30 seconds for full analysis
- **Animation Performance:** Framer Motion with hardware acceleration
- **Bundle Size:** No heavy charting libraries (custom SVG charts)

## Privacy & Security

- **Zero Storage:** Files processed in memory, never saved
- **Client-Side Results:** Analysis stored in browser localStorage only
- **No Tracking:** No analytics or user data collection
- **API Key Security:** Server-side only, never exposed to client

## Deployment

- **Platform:** Vercel (recommended)
- **Build Command:** `npm run build`
- **Environment:** Set `ANTHROPIC_API_KEY` in Vercel dashboard
- **Node Version:** 18+

## Known Patterns

### Counter Animation
```typescript
const count = useMotionValue(0);
const rounded = useTransform(count, (latest) => Math.round(latest));
useEffect(() => {
  const controls = animate(count, value, { duration });
  return controls.stop;
}, [count, value, duration]);
```

### Progress Tracking
```typescript
// In useFileAnalysis reducer
dispatch({ type: 'SET_STEP', step: 'uploading' });
dispatch({ type: 'SET_STEP', step: 'parsing' });
dispatch({ type: 'SET_STEP', step: 'analyzing' });
dispatch({ type: 'SET_STEP', step: 'complete' });
```

### AI Response Parsing
```typescript
const jsonMatch = content.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error('No JSON found');
return JSON.parse(jsonMatch[0]);
```

## Future Enhancements

- [ ] Export analysis to PDF/CSV
- [ ] Multi-statement comparison
- [ ] Budget tracking
- [ ] Recurring expense alerts
- [ ] Bank connection via Plaid
- [ ] Mobile app (React Native)

## Troubleshooting

### "Can't resolve 'tailwindcss'" Error
- Run: `rm -rf node_modules && npm install`
- Ensure `@tailwindcss/postcss` is in devDependencies

### Dark Mode Not Persisting
- Check `ThemeContext.tsx` localStorage logic
- Verify flash prevention script in `layout.tsx`

### AI Analysis Failing
- Verify `ANTHROPIC_API_KEY` is set
- Check API rate limits
- Review error logs in browser console

## Contact

For questions or contributions, see `/contact` page.
