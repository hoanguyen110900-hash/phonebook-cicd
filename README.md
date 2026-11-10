Link to application
https://phonebook-cicd-yjaq.onrender.com

## Local database

Set `MONGODB_URI` in `.env` to a connection string that includes the database
name, for example `mongodb+srv://<username>:<password>@<cluster>/phonebook`.
Without a database name, MongoDB uses `test`, which can make `/api/persons`
return `[]` even when your contacts exist in `phonebook.people`.
The API reads MongoDB; it does not load `frontend/db.json`.

Restart `npm run dev` after changing `.env`, then open
`http://localhost:3001/api/persons`.

## Render setup

Create a **Web Service** using the repository root (leave **Root Directory**
empty), with these settings:

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Environment:** set `MONGODB_URI` to your MongoDB connection string.

The build script installs the frontend's build dependencies and creates
`dist/index.html` and its assets. The `dist` directory is ignored by Git, so
Render must build it on every deployment. GitHub Actions' build output is not
transferred to Render. Installing only backend dependencies can leave the
server running while `/` returns 404 because the frontend files are missing.

For an existing service, update these settings and deploy the latest commit.
If the new service replaces the old one, update the GitHub Actions
`RENDER_DEPLOY_HOOK` secret to the new service's deploy hook.

GitHub Actions runs the CI pipeline on pushes and pull requests to `main`,
and it can also be started manually from the Actions tab. It uses Node.js 24,
installs dependencies from both lockfiles, lints the backend and frontend,
runs backend tests, and builds the frontend into the backend's `dist` directory.

To run the same checks locally:

```sh
npm ci
npm ci --prefix frontend
npm run lint
npm --prefix frontend run lint
npm test
npm run build:ui
```

The workflow has the following job structure:

```text
build_and_test → deploy → tag_release → notify_success / notify_failure
```

Backend tests use Node's built-in test runner to check person validation and
JSON serialization. Run them with `npm test`; no MongoDB connection or secrets
are required.
Pull requests only run these checks. Pushes to `main` and manual runs on
`main` also trigger a Render deployment for the checked commit, create a
`release-<run number>-<attempt>` Git tag, and send a Discord notification.
Failures in any of the three jobs trigger `notify_failure`, even when later
jobs are skipped. Cancelled runs do not send notifications.

In GitHub, open **Settings → Secrets and variables → Actions** and add:

- `RENDER_DEPLOY_HOOK`: the deploy hook URL from the Render service's Settings.
- `DISCORD_WEBHOOK`: the Discord channel's webhook URL.

The deploy job confirms Render accepted the deployment request; it does not
wait for the application to become live. The success notification reflects
this. Render must have its own build command configured, for example
`npm ci && npm run build`, and start command
`npm start`. Deploying a specific commit through a Render deploy hook disables
Render's automatic deploys, so subsequent deployments go through this workflow.
See [Render deploy hooks](https://render.com/docs/deploy-hooks) and
[deploying specific commits](https://render.com/docs/deploys).
