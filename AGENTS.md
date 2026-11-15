# Project Rules — Verified GitHub Release Policy

- **Automated GitHub Sync on New Versions**: Whenever a new version or milestone is created, always run the `github-release-sync` skill ([SKILL.md](.agents/skills/github-release-sync/SKILL.md)).
- **Error-Free Gate**: Before committing or pushing to GitHub, verify that both the backend (`python -c "from backend.main import app"`) and frontend (`npm run build`) pass with zero errors, and that `.env` credentials are excluded via `.gitignore`.
- **Automatic Push**: Once verified error-free, commit, tag the version (`vX.Y.Z`), and push to the GitHub `origin` remote (`main` branch + tags).
