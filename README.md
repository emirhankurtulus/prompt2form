# ⚡ Prompt2Form — AI-Powered Form Builder SaaS

Prompt2Form is a next-generation Software-as-a-Service (SaaS) application designed to automate the lifecycle of interactive web forms. Leveraging generative artificial intelligence, visual drag-and-drop mechanics, and automated data pipelines, users can instantly build, customize, publish, and integrate complex form sheets using plain natural language.

---

## 🌐 Live Production Demo

The project is fully deployed, optimized for serverless performance, and live on cloud resources:

*   **Production Live URL**: [https://prompt2form.vercel.app](https://prompt2form.vercel.app)
*   **Database Cloud Host**: MongoDB Atlas (Shared Cluster with automated indexing)
*   **App Server Hosting**: Vercel (Edge network deployment with Serverless Functions execution limits optimized)

---

## 🏗️ System Architecture & Data Flow

Prompt2Form is engineered using a robust serverless Next.js architecture integrated with a non-relational database. Below is the technical abstraction of the system components and data pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Next.js)                        │
│                                                                        │
│   ┌────────────────────┐   ┌────────────────────┐   ┌──────────────┐   │
│   │ Prompt Input Panel │   │ WYSIWYG Builder    │   │ CRM &        │   │
│   │ (Zustand State)    │   │ (dnd-kit Sortable) │   │ Analytics    │   │
│   └─────────┬──────────┘   └─────────┬──────────┘   └──────┬───────┘   │
└─────────────┼────────────────────────┼─────────────────────┼───────────┘
              │ (1) Prompt text        │ (3) Edit actions    │ (5) Fetch JSON
              ▼                        ▼                     ▼
┌─────────────┼────────────────────────┼─────────────────────┼───────────┐
│             │                        │                     │           │
│             ▼                        ▼                     ▼           │
│   ┌────────────────────┐   ┌────────────────────┐   ┌──────────────┐   │
│   │  /api/forms/gen    │   │ /api/forms/[id]    │   │ /api/stats   │   │
│   └─────────┬──────────┘   └─────────┬──────────┘   └──────┬───────┘   │
│             │                        │                     │           │
│             │ (2) Gemini API call    │ (4) Update Document │           │
│             ▼                        ▼                     │           │
│       ┌───────────┐            ┌───────────┐               │           │
│       │ Gemini AI │            │ MongoDB   │◄──────────────┘           │
│       │ 1.5 Flash │            │   Atlas   │                           │
│       └───────────┘            └─────┬─────┘                           │
│                                      │                                 │
│                                      │ (6) Save Response               │
│                                      ▼                                 │
│                            ┌───────────────────┐                       │
│                            │    /api/f/[id]    │                       │
│                            └─────────┬─────────┘                       │
│                                      │                                 │
│                 ┌────────────────────┴────────────────────┐            │
│                 ▼                                         ▼            │
│       ┌───────────────────┐                     ┌───────────────────┐  │
│       │ Google Sheets API │                     │ SMTP / Webhook    │  │
│       │ (Apps Script Sync)│                     │ (Nodemailer POST) │  │
│       └───────────────────┘                     └───────────────────┘  │
│                                                                        │
│                           SERVERLESS API LAYER                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack & Dependencies

*   **Frontend Framework**: Next.js 15 (React 19, App Router, Turbopack Build Optimizer)
*   **Language & Safety**: TypeScript (Strict typing for form schemas & Mongoose models)
*   **Database Engine**: MongoDB Atlas (Cloud database) utilizing Mongoose ODM
*   **Artificial Intelligence**: Google Generative AI SDK (Gemini 1.5 Flash Engine)
*   **State Management**: Zustand (Global Auth, UI State) & React Query / TanStack (Server-state caching)
*   **Styling System**: TailwindCSS & Vanilla CSS CSS variables (Strict monokrom dark aesthetic)
*   **Drag-and-Drop Canvas**: `@dnd-kit/core` & `@dnd-kit/sortable`
*   **Security & Session**: JWT (JsonWebToken) stored in secure HttpOnly cookies
*   **E-mail Transporter**: Nodemailer SMTP with connection pool & STARTTLS security

---

## 🔥 Core Capabilities & Features

### 1. Generative AI Prompt-to-Form Engine
- **LLM Prompting**: Utilizes Google Gemini 1.5 Flash to convert raw text prompts (e.g., *"Create a contact form with email, name, phone and feedback dropdown"*) into structured JSON form schemas.
- **Strict JSON Output**: Prompts are structurally validated to return exactly typed `FormField[]` objects containing IDs, labels, placeholders, categories, options list, and validation metrics.

### 2. WYSIWYG Visual Canvas Builder
- **Grid Layout Controller**: Supports flexible width adjustments (`100% Full`, `50% Half`, `33% Third`) per field with immediate visual layout updates.
- **Interactive Drag & Drop**: Real-time component sortable reordering using keyboard and pointer sensors.
- **Live Theme & CSS Variables Editor**: Inline theme modification where accent color, page background, card body color, border radius, and text color are rendered dynamically using React state.

### 3. Integrations Engine (Data Sync)
- **SMTP Notification**: Automates e-mail dispatch to form owners upon new submissions using custom HTML templates compatible with strict MailEnable / cPanel and Gmail anti-spam constraints.
- **Custom Webhook HTTP POST**: Relays submission payloads as JSON to external webhooks in real-time.
- **Google Sheets Integration**: Syncs incoming responses directly to a specified Google Sheet spreadsheet using an Apps Script Web App sync handler.

### 4. Submission CRM & Recharts Analytics
- **Analytics Dashboard**: Tracks total views, submission counts, and conversion rates.
- **CRM Response Table**: Paginated, sortable table displaying raw JSON responses dynamically.
- **CSV Data Export**: Single-click export of CRM data tables for Excel / CSV integration.

---

## 🔑 Database Schema Design

The application utilizes four highly optimized Mongoose models:

### 1. `User` Schema
Tracks authentication credentials, profile information, and Google OAuth flags.
```typescript
{
  email: { type: String, unique: true, lowercase: true },
  name: { type: String, required: true },
  passwordHash: { type: String }, // 'OAUTH_EXTERNAL_ACCOUNT' if Google OAuth
  avatarUrl: { type: String },
  emailVerified: { type: Boolean, default: false }
}
```

### 2. `Form` Schema
Houses the structural representation of the form layout, settings, and styling attributes.
```typescript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  slug: { type: String, unique: true }, // unique URL identifier
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PAUSED'] },
  formSchema: {
    pages: [{
      fields: [{
        id: String,
        type: String, // 'text', 'email', 'dropdown', etc.
        label: String,
        placeholder: String,
        options: [{ id: String, label: String, value: String }],
        style: { width: String }, // 'full', 'half', 'third'
        validation: { required: Boolean }
      }]
    }]
  },
  theme: {
    primaryColor: String,
    backgroundColor: String,
    inputBg: String,
    textColor: String,
    borderRadius: String
  }
}
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Local Configuration
Create a `.env.local` file in the root folder with the following variables:

```env
# Database URI (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prompt2form

# JWT Authentication Config
JWT_SECRET=use-a-secure-random-32-character-key
JWT_EXPIRES_IN=7d

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# SMTP Server Configurations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-smtp-account@gmail.com
SMTP_PASS=your-smtp-app-password
EMAIL_FROM=your-smtp-account@gmail.com

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## ☁️ Cloud Deployment (Vercel & MongoDB Atlas)

### 1. MongoDB Atlas Configuration
For production data persistency, configure a free shared cluster in MongoDB Atlas:
- In **Network Access**, allow access from all IPs (`0.0.0.0/0`) since Vercel utilizes dynamic serverless IP ranges.
- In **Database Access**, create a user with read/write privileges and obtain the connection string.

### 2. Vercel Serverless Optimization
The application features asynchronous operations (email notification dispatch & integration triggers) inside API routes. 
- **Serverless Timeouts**: Standard Next.js serverless functions on Vercel immediately terminate execution once a response headers are flushed. In `/src/app/api/forms/[formId]/responses/route.ts`, all async integrations (Nodemailer handshakes, Google Sheets API POSTs, and webhooks) are awaited using `Promise.allSettled()` to guarantee full data transmission before Vercel kills the function context.

### 3. Deploying via Vercel CLI
Deploying to production can be done in one command:
```bash
npm install -g vercel
vercel
```
Provide the production environment variables inside the Vercel Dashboard, and run `vercel --prod` to publish.
