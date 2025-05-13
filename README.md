# GitBoss AI – Frontend

## Setup 

1. Get the project from Github
  ```
  git clone https://github.com/GitBoss-AI/frontend
  git switch dev
  git pull
  ```

2. Create `.env` file with this
  ```
  NEXT_PUBLIC_API_BASE=http://localhost/dev
  ```
3. Run with pnpm
   ```
   pnpm i
   pnpm dev
   ```
4. Access the site at `localhost:3001/dev`

5. Login with a dev user
   ```
   username: gitboss-ai
   password: gitboss
   ```
6. In the settings enter your github api token and the repos you want to track with owner/repo structure in a comma seperated list
