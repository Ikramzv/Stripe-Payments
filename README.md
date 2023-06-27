# Stripe-Payments
Accepts payments, handles payments based on their status, creates payment intents

# Run App
- Sign in your Stripe account, or create new account. Go to dashboard page -> click on developers on the top right. Take secret and publishable keys
- Set `STRIPE_SK` .env variable
- To initialize Stripe on the client, pass your publishable key to `Stripe(<PUBLISHABLE_KEY>)`
- Run `npm install`
- Run `npm run dev`
