# GitBoss AI – Frontend

This is the frontend codebase for the GitBoss AI project. It is built using Next.js and deployed to a self-hosted server for both development and production environments.

## Development Workflow

### Environment Configuration

To ensure the frontend always talks to the correct backend during development, use the following environment variable:

```NEXT_PUBLIC_API_URL=https://gitboss-ai.emirbosnak.com/api-dev```

This ensures that:

- Local development (npm run dev) uses the remote dev API
- Preview builds and PRs also target the correct backend
- No mismatch between local/remote environments

Do not point to localhost or another API unless explicitly testing locally.

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

## API Endpoint (Dev)

The backend API for dev environment is available at:

https://gitboss-ai.emirbosnak.com/api-dev

Use this when making frontend requests during development. It is hosted alongside the frontend dev environment under a separate subpath.
