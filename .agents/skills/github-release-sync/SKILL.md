---
name: github-release-sync
description: >-
  Verify that a new version of a project is error-free (backend checks, frontend build,
  and secret safety) and automatically commit, tag, and push the verified version to GitHub.
  Use this skill whenever creating a new version, completing a feature milestone, or when
  the user asks to update or upload a verified version on GitHub.
---

# GitHub Verified Release Sync Skill (`github-release-sync`)

This skill ensures that **every new version** of the project is verified to be error-free before it is committed, tagged, and pushed to GitHub (`DataVedaTech`).

## Core Rule

> **Never push a broken build or exposed secret to GitHub.**
> Whenever a new version or feature milestone is completed, run the verification checks first. Only if all checks pass with exit code `0`, commit, tag, and push the update to GitHub.

---

## Step-by-Step Procedure

### 1. Pre-Flight Error-Free Verification

Run the automated release script [verify_and_push.ps1](./scripts/verify_and_push.ps1) or execute these checks manually:

1. **Secret & `.gitignore` Safety Check**:
   - Confirm `.env` and local `.db` files are ignored by `.gitignore` (`git check-ignore .env`).
   - Ensure no API keys or tokens are staged (`git status --short`).
2. **Backend Verification (Python / FastAPI)**:
   - Run syntax & import validation:
     ```powershell
     python -c "from backend.main import app; print('Backend OK')"
     ```
3. **Frontend Verification (React / Vite)**:
   - Run production build check:
     ```powershell
     cd frontend; npm run build
     ```
   - If either check fails, **stop immediately**, fix the errors, and re-run verification before touching Git.

### 2. Git Repository & Remote Initialization (First-Time Setup)

If the project is not yet a Git repository or does not have a GitHub remote:
1. Initialize Git (`git init` and `git branch -M main`).
2. Retrieve the stored GitHub token via `git credential fill` (`protocol=https`, `host=github.com`).
3. Check if `https://github.com/DataVedaTech/<repo-name>.git` exists; if not, create it via `POST https://api.github.com/user/repos`.
4. Add `origin` remote: `git remote add origin https://github.com/DataVedaTech/<repo-name>.git`.

### 3. Version Bump, Commit, Tag & Push

Once verification passes with zero errors:
1. Stage all tracked/new project files (`git add -A`).
2. Commit with a clear version message (e.g., `git commit -m "release(v1.1.0): <summary of changes>"`).
3. Create or update the version tag (`git tag -a v1.1.0 -m "Verified release v1.1.0"`).
4. Push branch and tags to GitHub:
   ```powershell
   git push -u origin main --tags
   ```

---

## One-Command Automation Script

Run the helper script from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/github-release-sync/scripts/verify_and_push.ps1 -Version "v1.0.0" -Message "Initial verified release of EvoxxLaunch" -RepoName "evoxxlaunch"
```
