# GitBoss AI – Frontend

This is the frontend codebase for the GitBoss AI project. It is built using Next.js and deployed to a self-hosted server for both development and production environments.

## Development Workflow

### PRs and Branching

- **Only open pull requests against the `dev` branch.**
- **Do not** open PRs against `main` — that branch is reserved for production.

### CI Check

- When a PR is opened to `dev`, a GitHub Actions workflow will:
  - Attempt to build the project
-  **Only merge if the build passes** — if it fails, the server will not update and the site will break.

## Automatic Dev Deployment

- Once a PR is merged into `dev`, the dev server will automatically pull the latest code and restart.
- The development version of the site is available at:

   **https://gitboss-ai.emirbosnak.com/dev**

- This happens within ~2 minutes after merging (via polling-based CI/CD).

## Future Improvements (Planned)

- Add web-accessible logs for the dev environment
- Implement production deployment from `main`
- Possibly migrate to webhook- or event-driven CI/CD if SSH becomes reliable
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions → Tailscale-connected self-hosted server
