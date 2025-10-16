# tiktaktok
Enhanced the traditional tic tac toe to create a whole new experience.

## Automatic Deployment to Netlify

This repository is configured with automatic deployment to Netlify using GitHub Actions. Every push to the `main` branch will trigger an automatic deployment.

### Setup Instructions

To enable automatic deployment, you need to configure the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following repository secrets:

   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
     - Get it from: https://app.netlify.com/user/applications#personal-access-tokens
   
   - `NETLIFY_SITE_ID`: Your Netlify site ID
     - Find it in: Site settings > General > Site details > Site ID

### Workflow Features

- ✅ Automatic deployment on push to `main` branch
- ✅ Preview deployments for pull requests
- ✅ Automatic dependency installation (if package.json exists)
- ✅ Automatic build step (if build script exists)
- ✅ Deploys to production on main branch

### Manual Deployment

You can also deploy manually using the Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```
