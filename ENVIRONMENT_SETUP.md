# Environment Setup for MetaLayer

## Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```bash
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# Server Configuration
PORT=3001
SESSION_SECRET=your_session_secret_here

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

## Getting Your DeepSeek API Key

1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Security Notes

- **Never commit your `.env` file to version control**
- **Keep your API keys secure and private**
- **Rotate your API keys regularly**
- **Use different keys for development and production**

## Setup Instructions

1. Copy the environment variables above into a new file: `server/.env`
2. Replace the placeholder values with your actual API keys
3. Start the server: `cd server && npm start`
4. The extension will now use your API key for the Agent functionality

## Troubleshooting

If you see "YOUR_DEEPSEEK_API_KEY_HERE" in the Agent tab, it means:
- The `.env` file is missing or not in the correct location
- The environment variable is not set correctly
- The server needs to be restarted after adding the `.env` file
