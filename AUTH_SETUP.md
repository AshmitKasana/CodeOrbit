# Auth Setup — Code Orbit

Code Orbit uses **Supabase Auth** for email/password and OAuth (Google, Apple,
optionally GitHub) sign-in. The frontend never touches a secret key — it only
ever holds the Supabase **anon** key, which is public by design and safe to
ship in a browser bundle. All of the real authentication logic lives in:

```
src/lib/supabase.js       — the Supabase client (guards against missing env vars)
src/services/authService.js — every supabase.auth.* call, in one place
src/context/AuthContext.jsx — the live session, exposed via useAuth()
src/components/ProtectedRoute.jsx — actually gates /dashboard, /profile, /bookmarks, /settings
```

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are not set, the app does
**not** crash and does **not** fake a logged-in state — every auth action
returns a clear "Authentication is not configured yet" error instead.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`
3. Put both in a local `.env` file (copy `.env.example` — `.env` is
   git-ignored and must never be committed).

That alone is enough for **email/password sign-up and sign-in** to work.

## 2. Email confirmation (optional but recommended)

In **Authentication → Providers → Email**, "Confirm email" is on by default
for new projects. With it on, `signUp()` returns a user but no session —
Code Orbit's Signup page detects this and shows "Check your email" instead of
falsely logging the user in. With it off, sign-up logs the user in
immediately. Either way works with no code changes.

## 3. Google OAuth

1. In the [Google Cloud Console](https://console.cloud.google.com/), create
   (or reuse) a project → **APIs & Services → Credentials** → **Create
   Credentials → OAuth client ID** → Application type **Web application**.
2. Add an **Authorized redirect URI**. Supabase needs its own callback URL
   here, which you'll find in Supabase under **Authentication → Providers →
   Google** — it looks like:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
3. Copy the generated **Client ID** and **Client Secret** into Supabase:
   **Authentication → Providers → Google** → paste both → toggle the
   provider **on** → Save.
4. In your Google OAuth client's **Authorized JavaScript origins**, add both
   your local and production origins (see step 5 below).

## 4. Apple OAuth

Apple's setup is more involved and requires a paid Apple Developer account:

1. In [Apple Developer](https://developer.apple.com/account/) → **Certificates,
   Identifiers & Profiles**:
   - Create an **App ID** (if you don't have one).
   - Create a **Services ID** — this is the OAuth "client ID" Supabase uses.
     Enable **Sign In with Apple** for it, and set its **Return URL** to your
     Supabase callback:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Create a **Sign in with Apple key** (a `.p8` private key), and note its
     **Key ID** and your **Team ID**.
2. Generate the client secret. Supabase does **not** accept the raw `.p8`
   file — it needs a JWT signed with it. This runs locally, nothing is
   uploaded (keep the `.p8` outside the repo; `*.p8` is git-ignored):
   ```bash
   node scripts/apple-client-secret.mjs "<path>/AuthKey_XXXXXXXXXX.p8" <TEAM_ID> <KEY_ID> <SERVICES_ID>
   ```
   Apple caps the secret at 6 months (the script issues 180 days), so
   **re-run it and paste the new value before it expires** or Apple sign-in
   will stop working.
3. In Supabase: **Authentication → Providers → Apple** → put the Services ID
   in **Client IDs**, paste the JWT into **Secret Key (for OAuth)** → toggle
   the provider **on** → Save.
That's all — no code or env changes are needed. The **Continue with Apple**
button is always shown and fully implemented; until the provider is enabled,
clicking it shows "Apple sign-in isn't available on this site yet" instead of
signing the user in. It starts working the moment step 3 is saved.

Enrollment note: Apple may require the Apple Developer *app* (iPhone/iPad/Mac
only, no Android) for identity verification in some regions.

## 5. Redirect URLs — local vs. production

Code Orbit sends users to `${window.location.origin}/auth/callback` after
any OAuth flow, and to `${window.location.origin}/reset-password` after a
password-reset email. Both are computed at runtime, so **no code changes are
needed between environments** — you only need to allow each origin in two
places:

**Supabase → Authentication → URL Configuration → Redirect URLs**, add:
```
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
https://your-production-domain.com/auth/callback
https://your-production-domain.com/reset-password
```

**Google Cloud Console → OAuth client → Authorized JavaScript origins**, add:
```
http://localhost:5173
https://your-production-domain.com
```

Never hardcode `localhost` into a production redirect — the app already
avoids this by using `window.location.origin`.

## 6. Optional: GitHub OAuth

Same pattern as Google — **Authentication → Providers → GitHub** in
Supabase, with a GitHub OAuth App created at
[github.com/settings/developers](https://github.com/settings/developers).
This is optional and separate from the navbar's GitHub icon, which is a
plain link to `https://github.com/AshmitKasana` and never used for sign-in.

## 7. Optional: the `profiles` table

The app works fully without a database — profile data comes straight from
the Supabase Auth user object (email, name from OAuth/signup metadata,
`created_at`). If you'd like a queryable `profiles` table anyway (e.g. to
extend it later with more fields), run this once in the Supabase SQL editor:

```sql
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
```

`authService.syncProfile()` already upserts into this table after every
sign-in/sign-up — it just no-ops quietly (with a console note in dev) until
you create the table, so nothing breaks either way.

## 8. Security notes

- The **anon key** is meant to be public — access control comes from Row
  Level Security policies, not from hiding the key.
- The **service_role key** must never appear in frontend code, an env var
  prefixed `VITE_`, or a committed file. Code Orbit's frontend never
  references it.
- Passwords are never handled or stored by this app — Supabase Auth owns
  credential storage entirely.
