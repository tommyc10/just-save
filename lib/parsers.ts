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

export async function parsePDF(file: File): Promise<Transaction[]> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Failed to parse PDF');
  }

  const { transactions } = await response.json();
  return transactions;
}

function normalizeTransactions(data: any[]): Transaction[] {
  if (!data.length) throw new Error('No data found in CSV file');

  const columns = Object.keys(data[0]).map((col) => col.toLowerCase().trim());

  const findColumn = (keywords: string[]) =>
    columns.find((col) => keywords.some((kw) => col.includes(kw)));

  const dateCol = findColumn(['date', 'transaction date', 'posting date']);
  const descCol = findColumn(['description', 'memo', 'merchant', 'payee']);
  const amountCol = findColumn(['amount', 'debit', 'credit', 'withdrawal', 'deposit']);

  if (!dateCol || !descCol || !amountCol) {
    throw new Error(`Could not find required columns. Found: ${columns.join(', ')}`);
  }

  const getOriginalKey = (lowerKey: string) =>
    Object.keys(data[0]).find((k) => k.toLowerCase().trim() === lowerKey)!;

  const transactions = data.reduce((acc: Transaction[], row) => {
    const date = row[getOriginalKey(dateCol)]?.trim();
    const description = row[getOriginalKey(descCol)]?.trim();
    const amountStr = row[getOriginalKey(amountCol)];

    if (!date || !description || !amountStr) return acc;

    const amount = Math.abs(parseFloat(String(amountStr).replace(/[$,]/g, '').trim()));

    if (isNaN(amount) || amount === 0) return acc;

    acc.push({
      date,
      description,
      amount,
      type: parseFloat(String(amountStr).replace(/[$,]/g, '')) < 0 ? 'debit' : 'credit',
    });
    return acc;
  }, []);

  if (!transactions.length) throw new Error('No valid transactions found in CSV');
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
