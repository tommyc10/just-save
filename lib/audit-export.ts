import { CategorizedSubscription, AuditReport } from './types';
import { formatCurrency } from './parsers';

export function generateAuditReport(subscriptions: CategorizedSubscription[]): AuditReport {
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const cancelled = subscriptions.filter((s) => s.category === 'cancel');
  const investigate = subscriptions.filter((s) => s.category === 'investigate');
  const keep = subscriptions.filter((s) => s.category === 'keep');

  const yearlySavings = cancelled.reduce((sum, sub) => {
    const yearly =
      sub.frequency === 'monthly'
        ? sub.amount * 12
        : sub.frequency === 'annual'
        ? sub.amount
        : sub.frequency === 'quarterly'
        ? sub.amount * 4
        : sub.amount * 52;
    return sum + yearly;
  }, 0);

  return {
    timestamp,
    totalSubscriptions: subscriptions.length,
    cancelledCount: cancelled.length,
    investigateCount: investigate.length,
    keepCount: keep.length,
    yearlySavings,
    monthlySavings: yearlySavings / 12,
    subscriptions,
  };
}

function getYearlyAmount(sub: CategorizedSubscription): number {
  switch (sub.frequency) {
    case 'monthly':
      return sub.amount * 12;
    case 'annual':
      return sub.amount;
    case 'quarterly':
      return sub.amount * 4;
    case 'weekly':
      return sub.amount * 52;
    default:
      return sub.amount * 12;
  }
}

export function exportToHTML(report: AuditReport): string {
  const cancelled = report.subscriptions.filter((s) => s.category === 'cancel');
  const investigate = report.subscriptions.filter((s) => s.category === 'investigate');
  const keep = report.subscriptions.filter((s) => s.category === 'keep');

  const generateRows = (subs: CategorizedSubscription[], category: 'cancelled' | 'investigate' | 'keep') => {
    return subs
      .map((sub) => {
        const yearly = getYearlyAmount(sub);
        const badgeClass = category === 'cancelled' ? 'badge-green' : category === 'investigate' ? 'badge-orange' : 'badge-grey';
        const strikethrough = category === 'cancelled' ? 'text-decoration: line-through; opacity: 0.7;' : '';
        const checkbox = category === 'investigate' ? '<input type="checkbox" class="select-checkbox" data-service="' + sub.name + '" data-amount="' + formatCurrency(sub.amount) + '">' : '';

        return `
        <div class="subscription-row" style="${strikethrough}">
          ${checkbox}
          <div class="sub-info">
            <div class="sub-header">
              <span class="sub-name blurrable">${sub.name}</span>
              <span class="badge ${badgeClass}">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </div>
            <div class="sub-details">
              <span class="amount">${formatCurrency(sub.amount)}/${sub.frequency}</span>
              <span class="separator">·</span>
              <span>${formatCurrency(yearly)}/year</span>
              ${sub.notes ? `<span class="separator">·</span><span class="note">${sub.notes}</span>` : ''}
            </div>
          </div>
        </div>`;
      })
      .join('\n');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Audit - ${report.timestamp}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
      line-height: 1.6;
      color: #171717;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 40px;
    }

    header {
      margin-bottom: 40px;
    }

    h1 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .meta {
      color: #737373;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 20px;
    }

    .stat-label {
      font-size: 12px;
      color: #737373;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #171717;
    }

    .stat-value.savings {
      color: #22c55e;
    }

    .stat-sub {
      font-size: 12px;
      color: #737373;
      margin-top: 4px;
    }

    .controls {
      display: flex;
      gap: 12px;
      margin-bottom: 40px;
      justify-content: center;
    }

    button {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #171717;
      color: white;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #171717;
    }

    .btn-secondary:hover {
      background: #e5e5e5;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 12px;
      cursor: pointer;
      margin-bottom: 12px;
      user-select: none;
    }

    .section-header:hover {
      background: #e5e5e5;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      flex: 1;
    }

    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      color: white;
    }

    .badge-green { background: #22c55e; }
    .badge-orange { background: #f97316; }
    .badge-grey { background: #737373; }

    .section-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-content.collapsed {
      display: none;
    }

    .subscription-row {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .select-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .sub-info {
      flex: 1;
    }

    .sub-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }

    .sub-name {
      font-weight: 600;
      font-size: 16px;
    }

    .sub-details {
      font-size: 14px;
      color: #737373;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .amount {
      font-weight: 600;
      color: #171717;
    }

    .separator {
      color: #d4d4d4;
    }

    .note {
      font-style: italic;
    }

    .floating-button {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #171717;
      color: white;
      padding: 16px 32px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: none;
      cursor: pointer;
      border: none;
      z-index: 1000;
    }

    .floating-button:hover {
      opacity: 0.9;
    }

    .floating-button.show {
      display: block;
    }

    .blurred .blurrable {
      filter: blur(8px);
      user-select: none;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #0a0a0a;
        color: #ededed;
      }

      .container {
        background: #171717;
      }

      .stat-card {
        background: #262626;
      }

      .stat-value {
        color: #ededed;
      }

      .btn-secondary {
        background: #262626;
        color: #ededed;
      }

      .btn-secondary:hover {
        background: #404040;
      }

      .section-header {
        background: #262626;
      }

      .section-header:hover {
        background: #404040;
      }

      .subscription-row {
        background: #262626;
      }

      .sub-name {
        color: #ededed;
      }

      .amount {
        color: #ededed;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Subscription Audit</h1>
      <p class="meta">
        Found ${report.totalSubscriptions} subscriptions · ${report.subscriptions.reduce((sum, s) => sum + s.transactions.length, 0)} transactions · ${report.timestamp}
      </p>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Cancelled</div>
        <div class="stat-value">${report.cancelledCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Needs Decision</div>
        <div class="stat-value">${report.investigateCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Yearly Savings</div>
        <div class="stat-value savings">${formatCurrency(report.yearlySavings)}</div>
        <div class="stat-sub">(${formatCurrency(report.monthlySavings)}/mo)</div>
      </div>
    </div>

    <div class="controls">
      <button class="btn-secondary" onclick="togglePrivacy()">Toggle Privacy</button>
    </div>

    ${cancelled.length > 0 ? `
    <div class="section">
      <div class="section-header" onclick="toggleSection('cancelled')">
        <span class="section-title">Cancelled</span>
        <span class="badge badge-green">${cancelled.length}</span>
        <span class="toggle-icon">▲</span>
      </div>
      <div class="section-content" id="cancelled-content">
        ${generateRows(cancelled, 'cancelled')}
      </div>
    </div>
    ` : ''}

    ${investigate.length > 0 ? `
    <div class="section">
      <div class="section-header" onclick="toggleSection('investigate')">
        <span class="section-title">Needs Decision</span>
        <span class="badge badge-orange">${investigate.length}</span>
        <span class="toggle-icon">▲</span>
      </div>
      <div class="section-content" id="investigate-content">
        ${generateRows(investigate, 'investigate')}
      </div>
    </div>
    ` : ''}

    ${keep.length > 0 ? `
    <div class="section">
      <div class="section-header" onclick="toggleSection('keep')">
        <span class="section-title">Keeping</span>
        <span class="badge badge-grey">${keep.length}</span>
        <span class="toggle-icon">▲</span>
      </div>
      <div class="section-content" id="keep-content">
        ${generateRows(keep, 'keep')}
      </div>
    </div>
    ` : ''}
  </div>

  <button class="floating-button" id="copyButton" onclick="copySelected()">
    Copy Selected
  </button>

  <script>
    function toggleSection(sectionId) {
      const content = document.getElementById(sectionId + '-content');
      const icon = event.currentTarget.querySelector('.toggle-icon');
      content.classList.toggle('collapsed');
      icon.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
    }

    function togglePrivacy() {
      document.body.classList.toggle('blurred');
    }

    // Handle checkbox selection
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('select-checkbox')) {
        updateCopyButton();
      }
    });

    function updateCopyButton() {
      const checkboxes = document.querySelectorAll('.select-checkbox:checked');
      const button = document.getElementById('copyButton');

      if (checkboxes.length > 0) {
        button.textContent = \`Copy \${checkboxes.length} Selected\`;
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    }

    function copySelected() {
      const checkboxes = document.querySelectorAll('.select-checkbox:checked');
      const items = Array.from(checkboxes).map(cb => {
        return \`\${cb.dataset.service} (\${cb.dataset.amount})\`;
      });

      const text = \`Cancel these:\\n\${items.join('\\n')}\`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard! Paste in chat to get cancellation help.');
      });
    }
  </script>
</body>
</html>
  `.trim();
}
