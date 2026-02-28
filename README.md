# 💰 just save

> Find and cancel forgotten subscriptions. Analyze your spending in under 90 seconds.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

- **📊 Instant Analysis** — Upload your bank statement and get a complete spending breakdown
- **🔄 Subscription Detection** — Automatically identifies recurring charges you might have forgotten
- **🤖 AI Insights** — Get personalized money-saving recommendations powered by Claude
- **🔒 Privacy First** — Files are analyzed locally and immediately discarded. Nothing is stored.

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/tommyc10/just-save.git
cd just-save

# Install dependencies
npm install

# Add your Anthropic API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

# Run the dev server
npm run dev
```

---

## 📁 Supported Formats

| Format | Status       |
| ------ | ------------ |
| CSV    | ✅ Supported |
| PDF    | ✅ Supported |

Works with most UK & US bank statement exports.

---

## 🛠 Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — Tailwind CSS 4
- **Animations** — Framer Motion
- **AI** — Anthropic Claude API
- **Parsing** — PapaParse (CSV) + pdf-parse (PDF)

---

## 📸 Preview

```
┌─────────────────────────────────────┐
│                                     │
│        💰 Total Spent: $2,847       │
│                                     │
├─────────────────────────────────────┤
│  📁 Categories    🔄 Subscriptions  │
│  ━━━━━━━━━━━━━    ━━━━━━━━━━━━━━━   │
│  Food     $847    Netflix   $15.99  │
│  Shopping $623    Spotify   $9.99   │
│  Bills    $412    ...               │
└─────────────────────────────────────┘
```

---

## 🔐 Privacy

Your financial data never leaves your browser (except for AI insights which are processed via Anthropic's API). No data is stored on any server.

---

## 📄 License

MIT © [Tommy Clark](https://github.com/tommyc10)

---

<p align="center">
  <sub>Built with ☕ and questionable financial decisions</sub>
</p>
