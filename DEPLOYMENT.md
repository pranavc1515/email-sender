# Deploying Email Sender API to Vercel

This guide will help you deploy your Email Sender API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Vercel CLI** (optional): Install with `npm i -g vercel`

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/email-sender-api.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Node.js project

3. **Configure Environment Variables:**
   - In your Vercel project dashboard, go to "Settings" → "Environment Variables"
   - Add the following variables:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=pranavc1515@gmail.com
     EMAIL_PASS=lrqd srpy hucx ciqz
     ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your API

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? `Select your account`
   - Link to existing project? `N`
   - Project name? `email-sender-api` (or your preferred name)
   - Directory? `./` (current directory)

## Post-Deployment

### 1. Get Your API URL
After deployment, Vercel will provide you with a URL like:
```
https://your-project-name.vercel.app
```

### 2. Test Your API
Test the health endpoint:
```bash
curl https://your-project-name.vercel.app/
```

### 3. Update Your Frontend
Update your frontend code to use the new Vercel URL:
```javascript
// Instead of localhost:3000
const API_URL = 'https://your-project-name.vercel.app';

// Send email
fetch(`${API_URL}/api/send-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Test Email',
    body: 'Hello from Vercel!'
  })
});
```

## Environment Variables in Vercel

The environment variables are configured in `vercel.json`, but you can also set them in the Vercel dashboard:

1. Go to your project dashboard
2. Settings → Environment Variables
3. Add:
   - `EMAIL_SERVICE` = `gmail`
   - `EMAIL_USER` = `pranavc1515@gmail.com`
   - `EMAIL_PASS` = `lrqd srpy hucx ciqz`

## Custom Domain (Optional)

1. In your Vercel project dashboard
2. Go to "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Monitoring & Logs

- **Function Logs**: View in Vercel dashboard under "Functions"
- **Analytics**: Available in the "Analytics" tab
- **Performance**: Monitor in "Speed Insights"

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working:**
   - Ensure they're set in Vercel dashboard
   - Redeploy after adding variables

2. **CORS Issues:**
   - The API has CORS enabled for all origins
   - If issues persist, check your frontend URL

3. **Email Not Sending:**
   - Verify Gmail app password is correct
   - Check Vercel function logs for errors

4. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Ensure `server.js` is the main file

## Security Notes

⚠️ **Important**: The Gmail app password is exposed in the `vercel.json` file. For production:

1. Remove the `env` section from `vercel.json`
2. Set environment variables only in Vercel dashboard
3. Consider using a dedicated email service like SendGrid for production

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
