import { SPENDING_CATEGORIES } from './constants';

/**
 * Prompt for CSV bank statement parsing
 * Handles various bank formats by letting AI identify columns
 */
export function getCSVParsingPrompt(csvText: string): string {
  return `You are a bank statement parser. Extract ALL transactions from this CSV bank statement.

IMPORTANT: Banks use many different CSV formats. You must intelligently identify:
- Which column contains the date (could be "Date", "Transaction Date", "Posted Date", "Value Date", etc.)
- Which column contains the description (could be "Description", "Memo", "Merchant", "Payee", "Details", "Narrative", etc.)
- Which column contains the amount (could be "Amount", "Debit", "Credit", "Withdrawal", "Deposit", separate debit/credit columns, etc.)
- Whether amounts are positive/negative, or if there are separate debit/credit columns

Return ONLY a valid JSON array with this exact structure:
[{"date": "the date as shown", "description": "merchant/payee name cleaned up", "amount": number, "type": "debit" or "credit"}]

RULES:
1. Extract EVERY transaction row - do not skip any
2. Amount should be a positive number
3. Type is "debit" for money spent/withdrawn/payments out, "credit" for money received/deposits/refunds
4. Clean up descriptions - remove excessive whitespace, reference numbers at the end, but keep the merchant name clear
5. Skip header rows, summary rows, balance rows - only actual transactions
6. If there are separate "Debit" and "Credit" columns, use whichever has a value
7. Handle different date formats gracefully
8. If a row doesn't look like a transaction (no amount, summary line, etc.), skip it

CSV Content:
${csvText}`;
}

/**
 * Prompt for PDF credit card/bank statement parsing
 * Extracts transactions from unstructured PDF text
 */
export function getPDFParsingPrompt(pdfText: string): string {
  return `Extract ALL transactions from this credit card statement as a JSON array.

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
${pdfText}

RESPOND WITH ONLY THE JSON ARRAY, NOTHING ELSE:`;
}

/**
 * Prompt for transaction analysis
 * Detects subscriptions, categorizes spending, generates insights
 */
export function getAnalysisPrompt(transactionList: string, totalSpent: number): string {
  const categoriesDoc = SPENDING_CATEGORIES.map((c) => {
    const descriptions: Record<string, string> = {
      'Food & Dining': 'restaurants, cafes, takeaway, groceries, supermarkets',
      'Entertainment': 'streaming, games, movies, events, hobbies',
      'Shopping': 'retail, online shopping, Amazon, clothing',
      'Transportation': 'fuel, parking, public transport, Uber/taxis, car expenses',
      'Bills & Utilities': 'phone, internet, electricity, water, council tax',
      'Health & Fitness': 'gym, pharmacy, medical, wellness',
      'Software & Tech': 'apps, subscriptions, software, domains',
      'Insurance': 'car, home, life, health insurance',
      'Travel': 'flights, hotels, holidays',
      'Personal Care': 'beauty, grooming, self-care',
      'Education': 'courses, books, training',
      'Transfers & Payments': 'bank transfers, credit card payments (if clearly visible)',
      'Other': "anything that doesn't fit above",
    };
    return `- "${c}" - ${descriptions[c] || ''}`;
  }).join('\n');

  return `You are a personal finance analyst. Analyze these bank transactions and provide a comprehensive breakdown.

TRANSACTIONS (all debits/spending):
${transactionList}

TOTAL SPENT: ${totalSpent.toFixed(2)}

Analyze and return a JSON object with this EXACT structure:

{
  "subscriptions": [
    {
      "name": "Clean service name (e.g., 'Netflix', 'Spotify', 'Gym Membership')",
      "amount": average monthly amount as number,
      "frequency": "weekly" | "monthly" | "quarterly" | "annual" | "unknown",
      "confidence": "high" | "medium" | "low",
      "transactionIndices": [array of transaction numbers from the list above]
    }
  ],
  "categories": [
    {
      "category": "Category Name",
      "transactionIndices": [array of transaction numbers]
    }
  ],
  "insights": {
    "overview": "1-2 sentence summary of spending patterns",
    "insight": "1 notable observation about their spending (subscriptions, habits, etc.)",
    "recommendation": "1 specific, actionable tip to save money"
  }
}

SUBSCRIPTION DETECTION RULES:
- Look for recurring charges (same merchant, similar amounts appearing multiple times)
- Common subscriptions: streaming (Netflix, Spotify, Disney+, YouTube), software (Adobe, Microsoft), fitness (gyms, apps), utilities, insurance, phone plans
- Detect frequency by analyzing dates between similar transactions
- "high" confidence = exact same amount, clear pattern; "medium" = similar amounts; "low" = might be subscription
- Include the transaction indices that belong to each subscription

CATEGORY RULES - Use these categories:
${categoriesDoc}

IMPORTANT:
- Every transaction should be assigned to exactly ONE category
- A transaction can be both in a subscription AND in a category
- Be conversational and friendly in insights, no finance jargon
- Return ONLY valid JSON, no markdown formatting`;
}
