# Stripe Integration Notes (sanitized)

- Never commit keys. Use environment variables:
  - STRIPE_SECRET_KEY
  - STRIPE_PUBLISHABLE_KEY
- Put test keys only in local .env files (gitignored).
- Rotate any previously exposed keys in the Stripe Dashboard.
