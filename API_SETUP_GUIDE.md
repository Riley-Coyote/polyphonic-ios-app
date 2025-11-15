# API Setup Guide for Polyphonic

This guide will help you configure API keys for the AI models in Polyphonic.

## Quick Start

1. **Launch the app** and go to **Settings**
2. **Enter your API keys** for the providers you want to use
3. **Test the connection** to verify everything works
4. **Start chatting** with multiple AI models simultaneously!

## Supported Providers

### OpenAI (GPT-5, GPT-4, etc.)

1. **Get your API key:**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign in or create an account
   - Navigate to API Keys section
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to Polyphonic:**
   - Open Settings in the app
   - Find "OpenAI" section
   - Paste your API key
   - Tap "Test Connection" to verify

3. **Pricing:** Pay-as-you-go, see [OpenAI Pricing](https://openai.com/pricing)

### Anthropic (Claude)

1. **Get your API key:**
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Sign in or create an account
   - Go to API Keys section
   - Generate a new key
   - Copy the key

2. **Add to Polyphonic:**
   - Open Settings in the app
   - Find "Anthropic" section
   - Paste your API key
   - Tap "Test Connection" to verify

3. **Pricing:** Pay-as-you-go, see [Anthropic Pricing](https://anthropic.com/pricing)

### Google (Gemini)

1. **Get your API key:**
   - Go to [makersuite.google.com](https://makersuite.google.com)
   - Sign in with Google account
   - Click "Get API Key"
   - Create or select a project
   - Copy the API key

2. **Add to Polyphonic:**
   - Open Settings in the app
   - Find "Google" section
   - Paste your API key
   - Tap "Test Connection" to verify

3. **Pricing:** Free tier available, then pay-as-you-go

### Other Providers

Support for **Moonshot**, **Meta (Llama)**, and **Mistral** is coming soon!

## Security

### How We Protect Your Keys

- **Secure Storage:** API keys are stored in iOS Keychain (most secure)
- **Encryption:** Keys are encrypted on device
- **Never Shared:** Keys never leave your device
- **No Analytics:** We don't track or log your API usage
- **Local Only:** All processing happens on your device

### Best Practices

1. **Never share your API keys** with anyone
2. **Set spending limits** on your provider accounts
3. **Rotate keys regularly** for security
4. **Monitor usage** in provider dashboards
5. **Revoke compromised keys** immediately

## Troubleshooting

### "Invalid API Key" Error

- Double-check you copied the entire key
- Ensure no extra spaces before/after the key
- Verify the key hasn't been revoked
- Check if the key has the right permissions

### "Connection Failed" Error

- Check your internet connection
- Verify the API service isn't down
- Ensure your account has available credits
- Try generating a new API key

### "Rate Limit Exceeded" Error

- Wait a few minutes and try again
- Check your provider's rate limits
- Consider upgrading your plan
- Spread requests across multiple models

### "Context Length Exceeded" Error

- Start a new conversation
- Clear old messages
- Use models with larger context windows
- Reduce the message size

## Cost Management

### Tips to Control Costs

1. **Monitor Usage:**
   - Check provider dashboards regularly
   - Set up billing alerts
   - Track tokens used per conversation

2. **Optimize Settings:**
   - Lower `max_tokens` for shorter responses
   - Adjust `temperature` for more focused outputs
   - Use efficient models (Haiku, GPT-5 Mini) for simple tasks

3. **Smart Model Selection:**
   - Use premium models (Opus, GPT-5) sparingly
   - Mix efficient and powerful models
   - Match model to task complexity

## Frequently Asked Questions

### Do I need all API keys?

No! You only need API keys for the providers you want to use. Start with one or two providers.

### Which provider should I start with?

- **OpenAI:** Most models, established ecosystem
- **Anthropic:** Strong reasoning, helpful responses
- **Google:** Free tier, large context windows

### Can I use the same API key on multiple devices?

Yes, but be aware this will combine usage across all devices.

### How much will this cost?

Costs depend on usage. Typical conversations:
- Light use: $5-10/month
- Regular use: $20-50/month
- Heavy use: $100+/month

### Is there a free tier?

- **Google Gemini:** Yes, generous free tier
- **OpenAI:** No, but new accounts get free credits
- **Anthropic:** No, pay-as-you-go only

## Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/Riley-Coyote/polyphonic-ios-app/issues)
2. Join our [Discord Community](https://discord.gg/polyphonic)
3. Email support: support@polyphonic.ai

## Next Steps

Once your API keys are configured:

1. **Select multiple models** in the Chat screen
2. **Send a message** to see parallel responses
3. **Observe resonance** scores between models
4. **Save interesting conversations** to memory
5. **Experiment** with different model combinations

Happy chatting with your AI constellation! 🌌