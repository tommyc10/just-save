import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import path from 'path';
import { fileURLToPath } from 'url';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set worker path dynamically
    const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
    PDFParse.setWorker(workerPath);

    // Parse PDF with verbosity set to errors only
    const parser = new PDFParse({
      data: buffer,
      verbosity: 0, // Set to 0 to suppress warnings
      useSystemFonts: true // Use system fonts to avoid font loading issues
    });
    const result = await parser.getText();
    const text = result.text;

    // Extract transactions from PDF text
    const transactions = extractTransactionsFromPDF(text);

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in PDF. Please ensure this is a valid bank statement.' },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log(`Extracted ${transactions.length} transactions`);
    console.log('Sample transactions:', transactions.slice(0, 3));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? `Failed to parse PDF: ${error.message}` : 'Failed to parse PDF file' },
      { status: 500 }
    );
  }
}

/**
 * Extract transactions from PDF text using pattern matching
 * Supports major UK and US bank statement formats
 */
function extractTransactionsFromPDF(text: string): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = text.split('\n');

  // Multiple date patterns to support different banks
  const datePatterns = [
    // UK format: "01 Dec", "29 Nov 2025"
    { regex: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{2,4})?/i, type: 'uk' },
    // US format: "12/31/2025", "1/5/25"
    { regex: /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(\d{2}|\d{4})/i, type: 'us' },
    // ISO format: "2025-12-31"
    { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})/i, type: 'iso' },
    // Alternative UK: "31/12/2025" or "31/12/25"
    { regex: /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/(\d{2}|\d{4})/i, type: 'uk_slash' },
  ];

  // Amount pattern: matches currency amounts like £1,234.56, $1,234.56, 1234.56, -$1,234.56
  const amountPattern = /[-−]?[$£€]?[\d,]+\.\d{2}/g;

  // Common header keywords to skip
  const headerKeywords = ['money out', 'money in', 'balance', 'description', 'date',
                          'amount', 'debit', 'credit', 'start balance', 'end balance',
                          'opening balance', 'closing balance', 'total', 'subtotal'];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Try each date pattern
    let dateMatch = null;
    let matchedDate = '';
    let dateType = '';

    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern.regex);
      if (dateMatch) {
        matchedDate = dateMatch[0];
        dateType = pattern.type;
        break;
      }
    }

    if (!dateMatch) continue;

    // Skip header lines
    const lowerLine = line.toLowerCase();
    if (headerKeywords.some(keyword => lowerLine.includes(keyword) &&
                                       lowerLine.indexOf(keyword) < 50)) {
      continue;
    }

    // Look ahead to see if description continues on next line(s)
    let fullLine = line;
    let nextLineIndex = i + 1;
    while (nextLineIndex < lines.length) {
      const nextLine = lines[nextLineIndex].trim();

      // Check if next line is a continuation (doesn't start with a date)
      const hasDate = datePatterns.some(p => p.regex.test(nextLine));
      const hasHeaderKeyword = headerKeywords.some(keyword =>
        nextLine.toLowerCase().includes(keyword));

      if (!hasDate && !hasHeaderKeyword && nextLine && nextLine.length < 100) {
        fullLine += ' ' + nextLine;
        nextLineIndex++;
      } else {
        break;
      }
    }

    // Find all amounts in the combined line
    const amounts = fullLine.match(amountPattern);
    if (!amounts || amounts.length === 0) continue;

    // Extract description - everything after date and before first amount
    let description = fullLine.substring(fullLine.indexOf(matchedDate) + matchedDate.length);
    const firstAmountIndex = description.indexOf(amounts[0]);
    if (firstAmountIndex !== -1) {
      description = description.substring(0, firstAmountIndex);
    }

    // Clean up description - remove common bank prefixes and suffixes
    description = description
      // UK bank prefixes
      .replace(/^(DD|Giro|STO|Online|BGC|CHQ|DEB|CR|DR)\s*/i, '')
      .replace(/Direct Debit to\s*/i, '')
      .replace(/Card Payment to\s*/i, '')
      .replace(/Card Purchase\s*/i, '')
      .replace(/Bill Payment (to|From)\s*/i, '')
      .replace(/Transfer From\s*/i, '')
      .replace(/Received From\s*/i, '')
      .replace(/Payment to\s*/i, '')
      // US bank prefixes
      .replace(/^(Debit|Credit|Check|ACH|Wire|ATM|POS|Online)\s*/i, '')
      .replace(/Purchase authorized on\s*/i, '')
      .replace(/Electronic withdrawal\s*/i, '')
      .replace(/Electronic deposit\s*/i, '')
      // Common suffixes
      .replace(/Ref:.*$/i, '')
      .replace(/Reference:.*$/i, '')
      .replace(/On \d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/i, '')
      .replace(/On \d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+\d{2,4})?$/i, '')
      .replace(/Sort Code.*$/i, '')
      .replace(/Account.*$/i, '')
      .replace(/Card ending in.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description || description.length < 2) {
      description = 'Transaction';
    }

    // Determine transaction type and amount
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';

    const lowerFullLine = fullLine.toLowerCase();

    // Detect credits (money in)
    const creditKeywords = ['received', 'transfer from', 'bill payment from', 'payment from',
                            'salary', 'refund', 'deposit', 'credit', 'paycheck', 'reimbursement',
                            'interest payment', 'dividend'];
    const isCredit = creditKeywords.some(keyword =>
      lowerFullLine.includes(keyword) || description.toLowerCase().includes(keyword)
    );

    type = isCredit ? 'credit' : 'debit';

    // Parse amounts intelligently
    // Strategy: Try to identify transaction amount vs balance
    if (amounts.length === 1) {
      // Only one amount
      const amt = parseFloat(amounts[0].replace(/[£$€,−-]/g, ''));

      // If it's very large (>10000) and we have other context, it might be a balance
      if (amt > 10000 && description.length < 5) {
        continue;
      }

      amount = Math.abs(amt);
    } else if (amounts.length === 2) {
      // Two amounts: Usually [transaction] [balance] or [debit] [credit]
      const amt1 = parseFloat(amounts[0].replace(/[£$€,−-]/g, ''));
      const amt2 = parseFloat(amounts[1].replace(/[£$€,−-]/g, ''));

      // Transaction is typically the smaller amount (balance is larger)
      // But if one is negative, use that as the transaction
      if (amounts[0].includes('-') || amounts[0].includes('−')) {
        amount = Math.abs(amt1);
      } else if (amounts[1].includes('-') || amounts[1].includes('−')) {
        amount = Math.abs(amt2);
      } else {
        amount = Math.min(Math.abs(amt1), Math.abs(amt2));
      }
    } else {
      // Three or more amounts: [debit] [credit] [balance] or similar
      // Use the first non-balance amount
      const parsedAmounts = amounts.map(a => Math.abs(parseFloat(a.replace(/[£$€,−-]/g, ''))));

      // Find the smallest amount that's not zero
      amount = parsedAmounts.filter(a => a > 0).sort((a, b) => a - b)[0] || parsedAmounts[0];
    }

    // Validate and skip invalid transactions
    if (isNaN(amount) || amount === 0) continue;
    if (amount > 50000) continue; // Skip suspiciously large amounts (likely balances)

    amount = Math.abs(amount);

    transactions.push({
      date: matchedDate,
      description,
      amount,
      type,
    });

    // Skip the lines we already processed
    i = nextLineIndex - 1;
  }

  return transactions;
}
