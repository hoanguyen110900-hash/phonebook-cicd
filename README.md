Link to application
https://phonebook-cicd-yjaq.onrender.com

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
