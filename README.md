# ⚡ Prompt2Form — AI-Powered Form Builder SaaS

Prompt2Form is a next-generation SaaS application that allows users to instantly generate, customize, publish, and manage interactive web forms using plain natural language prompts powered by AI.

🌐 **Live Demo**: [https://prompt2form.vercel.app](https://prompt2form.vercel.app)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root folder with the following variables:

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/prompt2form

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Notification (SMTP Settings)
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Core Framework**: Next.js 15 (App Router & Turbopack)
- **Language**: TypeScript
- **Database**: MongoDB & Mongoose ORM
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash)
- **Interactive Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Styling & Icons**: TailwindCSS, Vanilla CSS Tokens, Lucide Icons, Sonner Toasts
- **Animations**: Framer Motion
- **Data Analytics**: Recharts
- **Email Transporter**: Nodemailer (SMTP)
- **State Management**: Zustand & React Query

---

## 🏗️ Project Architecture

```
prompt2form/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Auth pages (Sign In, Sign Up, Password Reset, Verification)
│   │   ├── (dashboard)/          # Dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── forms/        # Form Management, Responses (CRM), Visual Builder
│   │   │       ├── templates/    # Pre-designed form template gallery
│   │   │       ├── analytics/    # Recharts analytics & drop-off rate charts
│   │   │       ├── integrations/ # Email, Webhook POST & Google Sheets Sync settings
│   │   │       ├── settings/     # Profile & Notification preferences
│   │   │       └── help/         # Help center, FAQ & support ticket submission
│   │   ├── api/                  # API endpoints (Auth, Forms, AI Generation, Responses, Integrations)
│   │   └── f/[slug]/             # Hosted public form viewer page
│   ├── components/               # UI components, Header, Sidebar, Topbar, Modals
│   ├── lib/                      # Database client, Gemini SDK, Nodemailer transporter, Utils
│   ├── store/                    # Zustand client auth & UI state management
│   └── types/                    # TypeScript schema and type definitions
├── .env.local                    # Environment configuration
└── README.md                     # Documentation
```

---

## 🔥 Key Project Capabilities

- **AI Prompt-to-Form Engine**: Generates 25+ dynamic field schemas from natural text with Gemini 1.5.
- **WYSIWYG Visual Canvas Builder**: Interactive paper canvas with live 100%, 50%, and 33% grid column width controls and drag & drop reordering.
- **Live Theme & Dark Mode Customizer**: Customizable accent colors, border radius, preset palettes, and full Dark Mode CSS variable compatibility.
- **Publish & Embed Suite**: One-click public form URLs (`/f/[slug]`) and ready-to-copy HTML `<iframe>` embed code.
- **3 Active Integrations**: Automated Email Notifications, Custom Webhook HTTP POST triggers, and Google Sheets Apps Script Web App sync.
- **Submission CRM & Analytics**: Detail viewer popover modal, single-click CSV export, view count tracking, and conversion rate analytics.
