# Frontend App

A React + Vite + Tailwind starter, structured so it's easy to hand off to (or build with) an AI coding agent, and easy to plug into a separate backend.

## 1. Run it locally

```bash
npm install
cp .env.example .env    # then edit VITE_API_BASE_URL if needed
npm run dev
```

Opens at http://localhost:5173. Right now `VITE_API_BASE_URL` probably points at a backend that doesn't exist yet — that's fine, you'll see a friendly error in the UI instead of a crash.

## 2. How it's structured (and why)

```
src/
  api/client.js       <- ALL network calls go through here
  hooks/useApi.js      <- generic data-fetching hook
  components/          <- UI pieces
  App.jsx               <- page composition
```

The point of `api/client.js` is that your friend's backend can look however it wants — the rest of the app never calls `fetch` directly. When the real backend is ready, you touch exactly two things:

1. `.env` → `VITE_API_BASE_URL`
2. the endpoint paths inside `api/client.js` (e.g. `itemsApi`) to match their actual routes

Everything else (components, hooks, UI state) keeps working unchanged.

### Two ways to connect to the backend

- **Direct URL**: set `VITE_API_BASE_URL=https://their-backend.com/api` in `.env`.
- **Dev proxy** (avoids CORS headaches while developing): leave `VITE_API_BASE_URL=/api` and set `VITE_API_PROXY_TARGET` in your shell, or edit the `target` in `vite.config.js`. Vite will forward `/api/*` calls straight to their backend.

Agree with your friend on: base URL/port, auth method (the client already sends `Authorization: Bearer <token>` if one exists in `localStorage`), and response shapes (what fields come back for `/items`, etc.) — then update `api/client.js` to match.

## 3. Building more of it with an AI coding agent

This repo is intentionally set up so an agent can extend it safely:

- **Claude Code** (terminal, VS Code, or desktop) is the most direct fit — point it at this repo and ask for a feature ("add a login page that calls `/auth/login` and stores the token"). Because all network logic is isolated in `api/client.js`, the agent can add new UI without guessing how requests should work.
- Give the agent context up front: paste your friend's actual API spec/OpenAPI doc/route list into the chat before asking for a feature, so it writes calls against the real shape instead of guessing.
- Work feature-by-feature, not "build the whole app" in one prompt — smaller diffs are easier to review and keep working end-to-end.
- After each feature, run `npm run dev` and click through it yourself before moving on.

If you don't already have it: Claude Code installs via `npm install -g @anthropic-ai/claude-code`, then run `claude` inside this folder.

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial frontend scaffold"
gh repo create your-repo-name --public --source=. --remote=origin --push
```

Don't have `gh` (GitHub CLI)? Do it manually instead:

```bash
git init
git add .
git commit -m "Initial frontend scaffold"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

`.env` is already in `.gitignore` so you won't accidentally commit secrets — only `.env.example` gets pushed.

## 5. Once your friend's backend is live

1. Update `.env` with their real URL.
2. Update the paths/fields in `api/client.js`.
3. Test each feature against the live backend.
4. Commit and push.
