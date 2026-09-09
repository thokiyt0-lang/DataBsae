# Deployment Guide: Supabase + Vercel + Render

This guide walks you through deploying your **Database Testing Dashboard Website** across **Supabase** (Database Backend), **Vercel** (Frontend Hosting), and **Render** (Alternative Frontend Hosting).

---

## Phase 1: Set Up Supabase Backend

1. **Create a Supabase Account & Project**:
   - Go to [supabase.com](https://supabase.com) and click **Start your project**.
   - Create an organization and click **New Project**.
   - Enter your Project Name (e.g., `db-testing-dashboard`) and a database password.

2. **Run the Database SQL Schema**:
   - In your Supabase project dashboard, navigate to **SQL Editor** on the left menu.
   - Click **New query**.
   - Copy and paste the contents of `schema.sql` (or copy directly from the **SQL Schema & RLS** tab in the website dashboard):
     ```sql
     -- Create records table
     CREATE TABLE IF NOT EXISTS public.records (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         name TEXT NOT NULL,
         email TEXT NOT NULL,
         phone TEXT,
         address TEXT,
         status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive', 'Archived')),
         created_at TIMESTAMPTZ DEFAULT NOW(),
         updated_at TIMESTAMPTZ DEFAULT NOW()
     );

     -- Enable Row Level Security (RLS)
     ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

     -- Create RLS Policies
     CREATE POLICY "Allow public read access" ON public.records FOR SELECT USING (true);
     CREATE POLICY "Allow public insert access" ON public.records FOR INSERT WITH CHECK (true);
     CREATE POLICY "Allow public update access" ON public.records FOR UPDATE USING (true);
     CREATE POLICY "Allow public delete access" ON public.records FOR DELETE USING (true);
     ```
   - Click **Run**. You should see `Success. No rows returned`.

3. **Get API Credentials**:
   - Go to **Project Settings** -> **API**.
   - Copy your **Project URL** (e.g., `https://xxxx.supabase.co`).
   - Copy your **anon / public** API key.

---

## Phase 2: Push Project to GitHub

1. Open PowerShell / Terminal in your project folder (`C:\Users\Nwarg\.gemini\antigravity\scratch\db-testing-dashboard`).
2. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Database Testing Dashboard"
   ```
3. Create a new repository on [github.com](https://github.com/new).
4. Link and push to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/db-testing-dashboard.git
   git branch -M main
   git push -u origin main
   ```

---

## Phase 3A: Deploy Frontend on Vercel

1. Log in to [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Select your `db-testing-dashboard` GitHub repository and click **Import**.
4. In the **Environment Variables** section, add the following two variables:
   - `VITE_SUPABASE_URL`: `<Your Supabase Project URL>`
   - `VITE_SUPABASE_ANON_KEY`: `<Your Supabase Anon Key>`
5. Click **Deploy**.
6. Vercel will build and assign you a live domain (e.g., `https://db-testing-dashboard.vercel.app`).

---

## Phase 3B: Deploy Frontend on Render

1. Log in to [render.com](https://render.com).
2. Click **New +** -> **Static Site**.
3. Connect your GitHub repository `db-testing-dashboard`.
4. Configure site settings:
   - **Name**: `db-testing-dashboard`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Under **Environment Variables**, add:
   - Key: `VITE_SUPABASE_URL` | Value: `<Your Supabase URL>`
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: `<Your Supabase Anon Key>`
6. Click **Create Static Site**.
7. Render will build and assign a live URL (e.g., `https://db-testing-dashboard.onrender.com`).

---

## Quick Summary Checklist

| Component | Platform | Environment Variables Needed |
| :--- | :--- | :--- |
| **Database** | Supabase | N/A (runs SQL `schema.sql`) |
| **Frontend Option 1** | Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **Frontend Option 2** | Render | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
