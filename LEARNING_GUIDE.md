# Learning Guide: Building the AI Spending Analyzer

This guide explains how each part of the app works, perfect for learning web development concepts.

## Architecture Overview

```
User uploads CSV
     ↓
Browser parses file (lib/parsers.ts)
     ↓
Browser analyzes transactions (lib/analyzer.ts)
     ↓
Browser sends summary to API (app/api/explain/route.ts)
     ↓
API calls Claude AI
     ↓
Results displayed (app/page.tsx)
```

**Key Point**: File never leaves browser! Only the analysis summary is sent to the server.

---

## Part 1: File Upload UI (app/page.tsx)

### What's Happening

The page has two views:
1. **Upload view**: Shows when no analysis exists
2. **Results view**: Shows after analyzing a file

### Key React Concepts

#### 1. Client Component

```typescript
'use client';
```

This tells Next.js this component runs in the browser (needs JavaScript). Required for:
- `useState` hooks
- Event handlers
- Interactive features

#### 2. State Management

```typescript
const [file, setFile] = useState<File | null>(null);
const [analysis, setAnalysis] = useState<Analysis | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

**State** = data that changes over time and triggers re-renders when updated.

- `file`: Currently uploaded file
- `analysis`: Results from analyzing transactions
- `isAnalyzing`: Loading state (shows "Analyzing...")

#### 3. Drag-and-Drop Events

```typescript
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Prevents default browser behavior (opening file)
  setIsDragging(true); // Visual feedback
};
```

Three events needed for drag-and-drop:
1. `onDragOver`: Fires continuously while dragging over element
2. `onDragLeave`: Fires when drag leaves the element
3. `onDrop`: Fires when file is dropped

#### 4. Conditional Rendering

```typescript
if (analysis) {
  return <ResultsView />;
}
return <UploadView />;
```

Shows different UI based on state. Simple but powerful pattern.

#### 5. File Validation

```typescript
if (
  fileType === 'text/csv' ||
  fileName.endsWith('.csv')
) {
  // Accept file
}
```

Checks both MIME type and file extension (some browsers report incorrect MIME types).

---

## Part 2: CSV Parsing (lib/parsers.ts)

### What's Happening

Converts CSV text → JavaScript objects (transactions)

### Key Concepts

#### 1. Async File Reading

```typescript
Papa.parse(file, {
  header: true, // First row = column names
  complete: (results) => {
    // Process data
  }
});
```

File parsing is **asynchronous** - uses callbacks since it takes time.

#### 2. Type Safety

```typescript
export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}
```

TypeScript ensures all transactions have these exact fields. Catches bugs early!

#### 3. Column Name Flexibility

```typescript
const dateCol = columns.find(col =>
  col.includes('date') ||
  col.includes('transaction date')
);
```

Different banks use different column names. We search for keywords instead of exact matches.

**Why this matters**: Makes the app work with any bank's CSV format!

#### 4. Data Cleaning

```typescript
const cleanAmount = String(amountValue)
  .replace(/[$,]/g, '') // Remove $ and commas
  .trim();
let amount = parseFloat(cleanAmount);
```

Real-world data is messy. Always clean it before using!

---

## Part 3: Analysis Logic (lib/analyzer.ts)

### What's Happening

Finds patterns in transactions:
1. Which charges are subscriptions?
2. What categories do you spend on?

### Key Concepts

#### 1. Subscription Detection

```typescript
const isSubKeyword = SUBSCRIPTION_KEYWORDS.some(keyword =>
  desc.includes(keyword.toLowerCase())
);
```

Looks for recurring charges with subscription-related keywords.

**Algorithm**:
1. Find transactions matching subscription keywords
2. Group by similar description
3. Keep only if appears 2+ times

**Learning Point**: Sometimes simple keyword matching is good enough! You don't always need complex ML.

#### 2. String Normalization

```typescript
function normalizeDescription(desc: string): string {
  return desc
    .replace(/[0-9]/g, '') // Remove numbers
    .replace(/[^a-zA-Z\s]/g, '') // Remove special chars
    .toLowerCase()
    .slice(0, 30); // Take first 30 chars
}
```

"Netflix 12345" and "Netflix 67890" become "netflix" → grouped together!

#### 3. Category Matching

```typescript
const CATEGORY_KEYWORDS = {
  'Food & Dining': ['starbucks', 'restaurant', 'pizza'],
  'Entertainment': ['netflix', 'spotify', 'movie'],
};
```

Simple keyword dictionary. Each transaction gets matched to a category.

#### 4. Percentage Calculations

```typescript
percentage: (categoryTotal / grandTotal) * 100
```

Shows relative spending - easier to understand than raw numbers.

---

## Part 4: AI Integration (app/api/explain/route.ts)

### What's Happening

Sends analysis summary to Claude → Gets human-readable insights back

### Key Concepts

#### 1. API Route Handler

```typescript
export async function POST(request: NextRequest) {
  // Handle POST requests to /api/explain
}
```

**Next.js magic**: File at `app/api/explain/route.ts` automatically creates endpoint at `/api/explain`

#### 2. Environment Variables

```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;
```

**Why `.env.local`?**
- Keeps secrets out of code
- Different keys for dev/production
- Never committed to git

#### 3. Anthropic SDK Usage

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});
```

**Parameters explained**:
- `model`: Which Claude version to use
- `max_tokens`: Maximum response length (1024 = ~750 words)
- `messages`: Conversation format (user asks, Claude responds)

#### 4. Prompt Engineering

```typescript
const prompt = `You are a personal finance advisor...

Total Spent: $${totalSpent.toFixed(2)}
Subscriptions: ${subscriptionsList}

Please provide:
1. Summary of spending patterns
2. Notable insights
3. One actionable recommendation`;
```

**Good prompts**:
- Clear role ("You are a...")
- Structured data
- Specific instructions
- Desired output format

**Learning Point**: The prompt is the "code" for AI! Small changes = big differences.

---

## Part 5: Styling with Tailwind (app/page.tsx)

### What's Happening

Tailwind CSS = utility classes instead of writing CSS files

### Key Concepts

#### 1. Utility Classes

```typescript
className="text-5xl font-bold text-gray-900 mb-4"
```

**Translation**:
- `text-5xl`: Very large text
- `font-bold`: Bold weight
- `text-gray-900`: Dark gray color
- `mb-4`: Margin bottom (1rem)

**Why Tailwind?**
- No need to name classes
- No CSS file juggling
- Consistent design system

#### 2. Responsive Design

```typescript
className="flex flex-col sm:flex-row"
```

- Mobile (default): Stack vertically
- Small screens+: Stack horizontally

#### 3. Conditional Classes

```typescript
className={`
  border-2 ${isDragging ? 'border-blue-500' : 'border-gray-300'}
`}
```

Changes style based on state. Template literals + ternary operator.

#### 4. Color System

```typescript
bg-gray-50    // Very light gray background
bg-blue-600   // Medium blue
text-gray-700 // Dark gray text
```

Tailwind's color scale: 50 (lightest) → 900 (darkest)

---

## Common Patterns & Best Practices

### 1. Error Handling

```typescript
try {
  const result = await riskyOperation();
} catch (err: any) {
  setError(err.message);
  console.error('Details:', err);
}
```

Always:
- Show user-friendly error messages
- Log full error for debugging
- Have a fallback UI

### 2. Loading States

```typescript
<button disabled={isAnalyzing}>
  {isAnalyzing ? 'Analyzing...' : 'Analyze Spending'}
</button>
```

Users need feedback! Always show:
- Loading indicators
- Disable buttons during async operations
- Clear state transitions

### 3. Type Safety

```typescript
interface Props {
  data: Analysis;
  onReset: () => void;
}
```

TypeScript catches bugs before runtime:
- Missing required data
- Wrong data types
- Typos in property names

### 4. Component Structure

```typescript
// ✅ Good: Single Responsibility
function UploadZone({ onFileSelect }) { }
function ResultsDisplay({ analysis }) { }

// ❌ Bad: Doing too much
function EverythingComponent() { }
```

Keep components focused on one thing.

---

## Debugging Tips

### 1. React DevTools

Install the browser extension to:
- Inspect component state
- See prop values
- Track re-renders

### 2. Console Logging

```typescript
console.log('File uploaded:', file.name);
console.log('Analysis result:', analysis);
```

Your best friend! Log everything while learning.

### 3. Network Tab

Open DevTools → Network to:
- See API requests
- Check request/response data
- Debug failed requests

### 4. TypeScript Errors

Read from bottom to top:
```
Type 'string' is not assignable to type 'number'
  in property 'amount'
```

Tells you exactly what's wrong and where!

---

## Next Learning Steps

### Beginner
1. Add a new category to spending analysis
2. Change the color scheme
3. Add more subscription keywords

### Intermediate
1. Add PDF parsing support
2. Create a comparison view (month over month)
3. Add export to PDF feature

### Advanced
1. Add data visualization (charts)
2. Create a browser extension version
3. Add email notifications for forgotten subscriptions

---

## Recommended Resources

### React & Next.js
- [React Docs (beta)](https://react.dev) - Official React documentation
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Total TypeScript](https://www.totaltypescript.com) - Free tutorials

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs) - Excellent searchable docs
- [Tailwind UI](https://tailwindui.com) - Component examples

### API Integration
- [Anthropic API Docs](https://docs.anthropic.com)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

## Key Takeaways

1. **Privacy First**: Parse files in browser when possible
2. **Start Simple**: Keyword matching works great for many use cases
3. **Type Safety**: TypeScript catches bugs early
4. **User Feedback**: Always show loading states and errors
5. **AI as a Tool**: Use it to enhance features, not replace logic
6. **Incremental Building**: Start with CSV, add PDF later

Happy coding! 🚀
