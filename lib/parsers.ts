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
 * Sends PDF to server-side API for processing
 */
export async function parsePDF(file: File): Promise<Transaction[]> {
  try {
    // Create FormData to send file to API
    const formData = new FormData();
    formData.append('file', file);

    // Call server-side API to parse PDF
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to parse PDF');
    }

    const data = await response.json();
    return data.transactions;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to parse PDF file');
  }
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
