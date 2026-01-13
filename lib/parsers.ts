import Papa from 'papaparse';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

/**
 * Parse CSV bank statement
 * Handles various bank formats by looking for common column names
 */
export async function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = normalizeTransactions(results.data as any[]);
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse PDF bank statement
 * This is a simplified version - real implementation would need more complex PDF parsing
 */
export async function parsePDF(file: File): Promise<Transaction[]> {
  // For MVP, we'll focus on CSV first
  // PDF parsing requires server-side processing with pdf-parse
  throw new Error(
    'PDF parsing coming soon! For now, please export your statement as CSV from your bank.'
  );
}

/**
 * Normalize different bank CSV formats into standard Transaction format
 * Looks for common column names across different banks
 */
function normalizeTransactions(data: any[]): Transaction[] {
  if (data.length === 0) {
    throw new Error('No data found in CSV file');
  }

  // Get column names from first row
  const firstRow = data[0];
  const columns = Object.keys(firstRow).map((col) => col.toLowerCase().trim());

  // Find date column
  const dateCol = columns.find(
    (col) =>
      col.includes('date') ||
      col.includes('transaction date') ||
      col.includes('posting date')
  );

  // Find description column
  const descCol = columns.find(
    (col) =>
      col.includes('description') ||
      col.includes('memo') ||
      col.includes('merchant') ||
      col.includes('payee')
  );

  // Find amount column
  const amountCol = columns.find(
    (col) =>
      col.includes('amount') ||
      col.includes('debit') ||
      col.includes('credit') ||
      col.includes('withdrawal') ||
      col.includes('deposit')
  );

  if (!dateCol || !descCol || !amountCol) {
    throw new Error(
      `Could not find required columns. Found: ${columns.join(', ')}`
    );
  }

  // Parse transactions
  const transactions: Transaction[] = [];

  for (const row of data) {
    // Get values using the found column names
    const dateValue = row[Object.keys(row).find((k) => k.toLowerCase().trim() === dateCol)!];
    const descValue = row[Object.keys(row).find((k) => k.toLowerCase().trim() === descCol)!];
    const amountValue = row[Object.keys(row).find((k) => k.toLowerCase().trim() === amountCol)!];

    if (!dateValue || !descValue || !amountValue) continue;

    // Parse amount
    const cleanAmount = String(amountValue)
      .replace(/[$,]/g, '')
      .trim();
    let amount = parseFloat(cleanAmount);

    if (isNaN(amount)) continue;

    // Determine if debit or credit
    // Negative amounts or explicit debit columns are debits
    const type: 'debit' | 'credit' = amount < 0 ? 'debit' : 'credit';
    amount = Math.abs(amount);

    // Skip zero amounts
    if (amount === 0) continue;

    transactions.push({
      date: dateValue.trim(),
      description: descValue.trim(),
      amount,
      type,
    });
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in CSV');
  }

  return transactions;
}

/**
 * Helper to format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
