# Peblo Notes

A lightweight, secure, and productivity-focused workspace for taking notes, organizing ideas, and extracting insights using integrated AI. Built as an internship assignment with practical SaaS architecture in mind.

## Overview

Peblo Notes is designed to feel like a real-world product. It features a clean, distraction-free writing environment, robust organization (tags and categories), public note sharing, and subtle AI integrations that don't get in the way of your workflow.

### Key Features
- **Secure Authentication:** Stateless JWT session management with HTTP-only cookies.
- **Note Management:** Full CRUD operations with auto-saving, archiving, and real-time UI updates.
- **Organization:** Flexible tagging and category system.
- **Public Sharing:** Securely publish notes to the web with unique, generated unguessable URLs.
- **Analytics Dashboard:** A clean, practical overview of workspace metrics and top tags.
- **Subtle AI Integration:** Generate concise summaries and extract action items directly from your notes without feeling like a generic chatbot wrapper.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui, Recharts.
- **Backend:** Next.js Route Handlers.
- **Database:** MongoDB & Mongoose.
- **AI Integration:** Google Gemini API (via `@google/genai`).
- **Authentication:** bcryptjs & jsonwebtoken.

## Setup Instructions

### 1. Clone & Install
```bash
git clone <repository-url>
cd peblo
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory (you can copy `.env.example`).
```bash
cp .env.example .env.local
```
Fill in the necessary values:
- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secure random string for signing JWT tokens.
- `GEMINI_API_KEY`: Your Google Gemini API key.

### 3. Run Locally
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Architecture Decisions
- **No Over-engineering:** Avoided massive Redux stores or generic API wrapper abstractions. State is managed locally where it makes sense, and URL params are used for shareable state.
- **Security-First Sharing:** Share IDs are generated using `crypto.randomBytes(16)` to ensure they are unguessable, and public responses explicitly strip sensitive DB metadata.
- **Simple Auth:** Kept authentication strictly to HTTP-only cookies to avoid token exposure to XSS, without building an overly complex session database.
