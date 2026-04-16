# Fix Vercel Dashboard 404 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Vercel to properly serve the `/dashboard/` route without 404 errors.

**Architecture:** Update `vercel.json` rewrites to map `/dashboard` and `/dashboard/` to `/dashboard/index.html`. The static files are already deployed; we just need to tell Vercel's router how to access them.

**Tech Stack:** Vercel static hosting, JSON configuration

---

## File Structure

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel routing configuration - needs rewrites for dashboard |
| `dashboard/index.html` | Already exists - the target of our rewrite |
| `dashboard/dashboard.css` | Already exists - dashboard styles |
| `dashboard/dashboard.js` | Already exists - dashboard logic |

---

## Task 1: Update vercel.json with Dashboard Routes

**Files:**
- Modify: `vercel.json`

**Context:** Currently `vercel.json` only has API rewrites. When accessing `/dashboard/`, Vercel doesn't know to serve `/dashboard/index.html`. We need to add static route rewrites.

- [ ] **Step 1: Update vercel.json with dashboard rewrites**

Replace the entire file content:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/dashboard",
      "destination": "/dashboard/index.html"
    },
    {
      "source": "/dashboard/",
      "destination": "/dashboard/index.html"
    },
    {
      "source": "/dashboard/(.*)",
      "destination": "/dashboard/$1"
    }
  ]
}
```

- [ ] **Step 2: Verify JSON syntax**

Run: `cat vercel.json | python3 -m json.tool`
Expected: Valid JSON output (no errors)

- [ ] **Step 3: Commit the change**

```bash
git add vercel.json
git commit -m "fix(vercel): add dashboard route rewrites to prevent 404"
```

---

## Task 2: Deploy to Vercel

**Files:** None (deployment step)

- [ ] **Step 1: Deploy to Vercel**

Run: `vercel --prod` (or push to git if auto-deploy is configured)

- [ ] **Step 2: Verify deployment**

Wait for deployment to complete, then test:
```bash
curl -I https://portal.thegenalphalabs.com/dashboard/
```
Expected: HTTP 200 OK (not 404)

---

## Verification Steps (Post-Deployment)

After all tasks complete, verify:

1. **Dashboard loads:** Visit `https://portal.thegenalphalabs.com/dashboard/` in browser
2. **No 404:** Should see the Matrix-themed dashboard with 6 app icons
3. **Session check works:** If not logged in, should redirect to login
4. **All assets load:** Check browser dev tools - no 404s for CSS/JS files
5. **Logout works:** Click DISCONNECT button returns to login page

---

## Troubleshooting

If 404 persists after deployment:

1. **Check file structure:** Verify `dashboard/index.html` exists in the deployment
2. **Check rewrite order:** The specific `/dashboard` rules should come before catch-all rules
3. **Try trailing slash variation:** Test both `/dashboard` and `/dashboard/`
4. **Vercel logs:** Check `vercel logs` for routing errors
5. **Redeploy:** Sometimes a fresh deployment is needed: `vercel --force`