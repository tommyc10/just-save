# Just Save - Interactive Subscription Cancellation Tool

## Project Overview

Just Save is a privacy-focused web application that helps users identify, categorize, and cancel forgotten subscriptions. Built with Next.js 16 and React 19, powered by Claude AI for intelligent transaction analysis.

**Core Functionality:**
- AI-powered CSV/PDF bank statement parsing
- Subscription detection and spending analysis
- Interactive categorization workflow (Cancel/Investigate/Keep)
- Audit view with copy-to-cancel functionality
- HTML export for record keeping
- Interactive spending visualization with donut charts
- Universal dark/light theme support
- Zero-storage architecture (all processing client-side)

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router, Turbopack)
- **UI:** React 19.2.3, TypeScript 5, Tailwind CSS v4
- **Animation:** Framer Motion 12.26.2
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **PDF Processing:** pdf-parse (client-side)
- **State Management:** React useReducer pattern

## User Flow

1. **Upload** → User uploads CSV or PDF bank statement
2. **Analysis** → AI parses transactions and detects subscriptions
3. **Results** → View spending breakdown with charts and insights
4. **Categorization** → Categorize each subscription (Cancel/Investigate/Keep)
5. **Audit** → Interactive audit view with copy-to-cancel functionality
6. **Export** → Download standalone HTML report

## Project Architecture

```
spending-analyzer/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Main app with view routing
│   ├── layout.tsx               # Root layout with ThemeProvider
│   ├── globals.css              # Global styles + CSS variables
│   ├── api/
│   │   ├── parse-csv/route.ts   # CSV parsing endpoint
│   │   ├── parse-pdf/route.ts   # PDF parsing endpoint
│   │   └── analyze/route.ts     # Transaction analysis endpoint
│   ├── changelog/page.tsx       # Changelog page
│   ├── privacy/page.tsx         # Privacy policy
│   ├── terms/page.tsx           # Terms of service
│   ├── faq/page.tsx             # FAQ
│   ├── contact/page.tsx         # Contact form
│   └── refer/page.tsx           # Referral program
│
├── components/                  # React components
│   ├── UploadView.tsx          # File upload interface
│   ├── ResultsView.tsx         # Analysis results display
│   ├── CategorizationView.tsx  # Subscription categorization workflow
│   ├── AuditView.tsx           # Interactive audit with copy-to-cancel
│   ├── SpendingDonutChart.tsx  # Interactive SVG donut chart
│   ├── CategoryBreakdown.tsx   # Category spending details
│   ├── AIInsights.tsx          # AI-generated spending insights
│   ├── ProgressIndicator.tsx   # Multi-step progress bar
│   ├── ThemeToggle.tsx         # Dark mode toggle button
│   ├── Footer.tsx              # Footer navigation
│   └── Icons.tsx               # SVG icon components
│
├── contexts/
│   └── ThemeContext.tsx        # Theme state + localStorage persistence
│
├── hooks/
│   └── useFileAnalysis.ts      # File analysis state machine (useReducer)
│
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── constants.ts            # Configuration constants
│   ├── prompts.ts              # AI prompt templates
│   ├── parsers.ts              # CSV/PDF parsing utilities
│   ├── analyzer.ts             # Transaction analysis logic
│   ├── audit-export.ts         # HTML audit generation
│   └── ai/
│       ├── client.ts           # Anthropic client singleton
│       └── utils.ts            # AI response parsing utilities
│
└── public/                     # Static assets
```

## Key Components

### UploadView
- Drag-and-drop file upload
- Progress indicator for analysis steps (Upload → Parse → Analyze)
- File validation (CSV/PDF only)
- Error handling

### ResultsView
- Animated counter showing total spending
- AI-generated spending insights
- Interactive donut chart (hover/click)
- Category breakdown with transaction details
- CTA button to start categorization workflow

### CategorizationView
- Batch categorization (7 subscriptions at a time)
- Three categories: Cancel, Investigate, Keep
- Optional notes for each decision
- Progress bar showing batch progress
- Navigation between batches

### AuditView
- Summary statistics (cancelled, investigating, yearly savings)
- Three collapsible sections:
  - **Cancelled** (green badge, strikethrough)
  - **Needs Decision** (orange badge, checkboxes)
  - **Keeping** (grey badge, reference only)
- Floating copy button (appears when items selected)
- Privacy mode (blur service names)
- Export to HTML button

### SpendingDonutChart
- SVG-based custom donut chart
- Animated segment reveals
- Hover/click to highlight segments
- Center displays category details or total
- Color-coded legend

## State Management

### useFileAnalysis Hook (useReducer)

**State:**
```typescript
{
  file: File | null
  isDragging: boolean
  isAnalyzing: boolean
  analysisStep: 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete'
  analysis: Analysis | null
  insights: AIInsights | null
  error: string
  currentView: 'upload' | 'results' | 'categorization' | 'audit'
}
```

**Actions:**
- `SET_DRAGGING` - Toggle drag state
- `SET_FILE` - Set uploaded file
- `CLEAR_FILE` - Clear file
- `START_ANALYSIS` - Begin analysis
- `SET_STEP` - Update progress step
- `ANALYSIS_SUCCESS` - Store results
- `ANALYSIS_ERROR` - Handle errors
- `SET_VIEW` - Navigate between views
- `UPDATE_ANALYSIS` - Update categorized subscriptions
- `RESET` - Reset to initial state

### Theme Management (Context)

**State:**
```typescript
{
  theme: 'light' | 'dark' | 'system'
  resolvedTheme: 'light' | 'dark'
}
```

**Features:**
- System preference detection
- localStorage persistence
- Flash prevention (inline script in layout.tsx)
- Universal support across all pages

## Type System

### Core Types
```typescript
interface Transaction {
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
}

interface Subscription {
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'unknown'
  confidence?: 'high' | 'medium' | 'low'
  transactions: Transaction[]
}

type SubscriptionCategory = 'cancel' | 'investigate' | 'keep'

interface CategorizedSubscription extends Subscription {
  category?: SubscriptionCategory
  notes?: string
  cancelledDate?: string
}

interface Analysis {
  subscriptions: CategorizedSubscription[]
  categorySpending: CategorySpending[]
  totalSpent: number
  insights?: AIInsights
}

interface AuditReport {
  timestamp: string
  totalSubscriptions: number
  cancelledCount: number
  investigateCount: number
  keepCount: number
  yearlySavings: number
  monthlySavings: number
  subscriptions: CategorizedSubscription[]
}
```

## AI Integration

### Endpoints

**POST /api/parse-csv**
- Input: FormData with CSV file
- Process: AI-powered CSV parsing (no hardcoded column detection)
- Output: `{ transactions: Transaction[] }`

**POST /api/parse-pdf**
- Input: FormData with PDF file
- Process: pdf-parse → AI extraction
- Output: `{ transactions: Transaction[] }`

**POST /api/analyze**
- Input: `{ transactions: Transaction[] }`
- Process: AI categorization, subscription detection, insights generation
- Output: `{ analysis: Analysis }`

### Prompts

All AI prompts centralized in `lib/prompts.ts`:
- `CSV_PARSE_PROMPT` - Extract transactions from CSV
- `PDF_PARSE_PROMPT` - Extract transactions from PDF text
- `ANALYZE_PROMPT` - Categorize spending and detect subscriptions

### Error Handling
- JSON extraction with retry logic
- Graceful degradation for failed AI responses
- User-friendly error messages
- Validation at API boundaries

## Styling & Theming

### CSS Variables (globals.css)

**Light Mode:**
```css
:root {
  --background: #ffffff
  --foreground: #171717
  --muted: #f5f5f5
  --muted-foreground: #737373
  --border: #e5e5e5
  --card: #ffffff
  --accent: #f5f5f5
}
```

**Dark Mode:**
```css
.dark {
  --background: #0a0a0a
  --foreground: #ededed
  --muted: #262626
  --muted-foreground: #a3a3a3
  --border: #262626
  --card: #171717
  --accent: #262626
}
```

### Semantic Color Classes
- `bg-background` / `text-foreground` - Primary colors
- `bg-muted` / `text-muted-foreground` - Secondary colors
- `border-border` - Borders
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-accent` - Accent backgrounds

### Animation Constants (lib/constants.ts)
```typescript
ANIMATION_TIMINGS = {
  COUNTER_DURATION: 2,          // Counter animation (2s)
  BREAKDOWN_DELAY: 2500,        // Delay before showing breakdown (2.5s)
  STAGGER_DELAY: 0.05,          // Stagger between items (50ms)
  CATEGORY_BASE_DELAY: 0.6,     // Base delay for categories (600ms)
  PROGRESS_BAR_BASE_DELAY: 0.7  // Base delay for progress bar (700ms)
}
```

## HTML Export

### Features
- Standalone HTML file (no external dependencies)
- Embedded CSS with light/dark mode support
- Interactive features:
  - Collapsible sections
  - Checkbox selection
  - Copy-to-clipboard button
  - Privacy blur toggle
- Responsive design
- Generated via `lib/audit-export.ts`

### Export Format
```
subscription-audit-YYYY-MM-DD.html
```

## Privacy & Security

- **Zero Storage:** Files processed in memory, immediately discarded
- **Client-Side Results:** Analysis stored only in browser localStorage
- **No Tracking:** No analytics or user data collection
- **API Key Security:** Server-side only, never exposed to client
- **Local Processing:** PDF parsing happens client-side when possible

## Code Conventions

### TypeScript
- Strict type checking enabled
- Types centralized in `lib/types.ts`
- Interface naming: `ComponentNameProps`
- Use `type` for unions, `interface` for objects

### React Patterns
- `'use client'` directive for all interactive components
- `useReducer` for complex state management
- Custom hooks in `/hooks` directory
- Server components for API routes only

### File Organization
- One component per file
- Co-locate styles with components (Tailwind)
- Group related utilities in `/lib`
- Export all components via `components/index.ts`

## Animation Patterns

### Counter Animation
```typescript
const count = useMotionValue(0);
const rounded = useTransform(count, (latest) => Math.round(latest));
useEffect(() => {
  const controls = animate(count, value, { duration });
  return controls.stop;
}, [count, value, duration]);
```

### Staggered Reveals
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

### SVG Donut Animation
```typescript
<motion.circle
  initial={{ strokeDasharray: `0 ${circumference}` }}
  animate={{ strokeDasharray: dashArray }}
  transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
/>
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-... # Required for all AI features
```

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Deployment

**Recommended Platform:** Vercel

**Configuration:**
1. Connect GitHub repository
2. Set environment variable: `ANTHROPIC_API_KEY`
3. Deploy (automatic on push to main)

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node Version: 18+

## Common Development Tasks

### Adding a New Page
1. Create `app/[route]/page.tsx`
2. Import `ThemeToggle` component
3. Use semantic color classes (`bg-background`, `text-foreground`)
4. Add to footer navigation in `components/Footer.tsx`

### Modifying AI Prompts
1. Edit `lib/prompts.ts`
2. Test with various statement formats
3. Ensure JSON response format maintained
4. Update type definitions in `lib/types.ts` if schema changes

### Adding Animation
1. Import from `framer-motion`
2. Use constants from `lib/constants.ts` (ANIMATION_TIMINGS)
3. Follow existing patterns (see `ResultsView.tsx`, `SpendingDonutChart.tsx`)

### Updating Theme Colors
1. Edit CSS variables in `app/globals.css`
2. Update both `:root` (light) and `.dark` sections
3. Test in both light and dark modes

## Testing Checklist

- [ ] Upload CSV file (various bank formats)
- [ ] Upload PDF file (various statement layouts)
- [ ] Theme toggle works on all pages
- [ ] Theme persists on refresh
- [ ] Progress indicator shows all steps correctly
- [ ] Donut chart animates and responds to interactions
- [ ] Categorization workflow (all batches)
- [ ] Audit view copy-to-cancel functionality
- [ ] HTML export downloads correctly
- [ ] Privacy mode blurs names
- [ ] Mobile responsive design
- [ ] Error handling for invalid files
- [ ] Dark mode contrast (accessibility)

## Performance

- **File Size Limits:** Enforced in `lib/constants.ts`
- **AI Response Time:** ~10-30 seconds for full analysis
- **Animation Performance:** Hardware-accelerated via Framer Motion
- **Bundle Size:** ~200KB gzipped (no heavy charting libraries)
- **First Contentful Paint:** < 1.5s (on Vercel)

## Known Limitations

- Requires internet connection for AI analysis
- File size limited to prevent API timeouts
- CSV format must contain transaction data
- PDF text extraction quality varies by bank

## Future Enhancements

- [ ] Export analysis to CSV
- [ ] Multi-statement comparison
- [ ] Budget tracking and alerts
- [ ] Bank connection via Plaid
- [ ] Recurring expense notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels)

## Support

- **Issues:** https://github.com/tommyc10/just-save/issues
- **Documentation:** See README.md
- **Contact:** See `/contact` page

## License

See LICENSE file in repository.
