# Quick Start Checklist

Get up and running in 5 minutes!

## ✅ Setup Checklist

### 1. Dependencies Installed
```bash
npm install
```
Already done! ✓

### 2. Get Anthropic API Key
- [ ] Go to https://console.anthropic.com/
- [ ] Create account / sign in
- [ ] Generate API key
- [ ] Copy key (starts with `sk-ant-`)

### 3. Configure Environment
- [ ] Create file: `.env.local` in project root
- [ ] Add line: `ANTHROPIC_API_KEY=sk-ant-your-key-here`
- [ ] Save file

### 4. Start Server
```bash
npm run dev
```
Already running at http://localhost:3001! ✓

### 5. Test It
- [ ] Open http://localhost:3001
- [ ] Upload: `sample-data/bank-statement-sample.csv`
- [ ] Click "Analyze Spending"
- [ ] See AI insights appear!

## 🚨 If Something Goes Wrong

### "API key not configured"
→ Check `.env.local` exists and has correct format

### "Failed to generate explanation"
→ Verify API key is valid and has credits

### Upload not working
→ Try the sample CSV first to test

## 📁 Project Files Overview

```
spending-analyzer/
├── app/
│   ├── page.tsx                 # Main UI (upload + results)
│   └── api/explain/route.ts     # Claude AI endpoint
├── lib/
│   ├── parsers.ts               # CSV parsing
│   └── analyzer.ts              # Subscription detection
├── sample-data/
│   └── bank-statement-sample.csv # Test file
├── .env.local                   # YOUR API KEY (create this!)
├── README.md                    # Full documentation
├── SETUP.md                     # Detailed setup guide
└── LEARNING_GUIDE.md            # Code explanations
```

## 🎯 What You Built

**Features**:
- Drag-and-drop CSV upload
- Automatic subscription detection
- Spending categorization
- AI-powered insights with Claude
- Privacy-first (no server storage)

**Tech Stack**:
- Next.js 15 + TypeScript
- Tailwind CSS
- Anthropic Claude API
- PapaParse

## 🚀 Next Steps

1. **Test with your own bank statement**
   - Export CSV from your bank
   - Upload and analyze

2. **Customize it**
   - Add categories (lib/analyzer.ts)
   - Change colors (app/page.tsx)
   - Modify AI prompt (app/api/explain/route.ts)

3. **Learn more**
   - Read LEARNING_GUIDE.md for detailed explanations
   - Check README.md for deployment instructions

## 💡 Pro Tips

- Use sample CSV to verify setup works
- Check browser console (F12) for errors
- Read LEARNING_GUIDE.md to understand how each part works
- Start with small changes to experiment

Happy building! 🎉
