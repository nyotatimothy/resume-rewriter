# International Payment Setup Guide

## Quick Solutions for International Payments

### 1. **LemonSqueezy (Recommended)**
- **Best for**: SaaS subscriptions
- **International support**: Excellent
- **Setup time**: 10 minutes
- **Fees**: 3.5% + $0.50 per transaction

**Setup:**
1. Go to [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create account and store
3. Create a product for $7/month subscription
4. Replace `PRODUCT_ID` in the code with your actual product ID
5. Update the URL in `src/app/pricing/page.tsx`

### 2. **Gumroad (Simplest)**
- **Best for**: One-time payments
- **International support**: Good
- **Setup time**: 5 minutes
- **Fees**: 3.5% + $0.30 per transaction

**Setup:**
1. Go to [gumroad.com](https://gumroad.com)
2. Create account
3. Create a product for $7
4. Replace the Gumroad URL in the code

### 3. **Paddle (Enterprise)**
- **Best for**: High-volume, global businesses
- **International support**: Excellent
- **Setup time**: 30 minutes
- **Fees**: 5% + $0.50 per transaction

### 4. **Stripe (Current Setup)**
- **Best for**: Full control, custom checkout
- **International support**: Excellent
- **Setup time**: 2-3 hours
- **Fees**: 2.9% + $0.30 per transaction

## Implementation Steps

### Option A: Quick Fix (LemonSqueezy)
1. Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create a product: "Resume Rewriter Pro" - $7/month
3. Copy your product ID
4. Update this line in `src/app/pricing/page.tsx`:
   ```javascript
   window.location.href = "https://your-store.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID"
   ```

### Option B: Keep Current PayPal + Add Options
The current implementation now shows multiple payment options when users click "Upgrade to Pro".

## Environment Variables Needed

For LemonSqueezy webhooks (optional but recommended):
```env
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_API_KEY=your_api_key
```

## Testing International Payments

1. **Test with different countries**: Use VPN to test from different locations
2. **Test different currencies**: LemonSqueezy automatically handles currency conversion
3. **Test different payment methods**: Credit cards, PayPal, Apple Pay, etc.

## Webhook Integration (Optional)

To automatically upgrade users after payment, you'll need webhook endpoints:

```typescript
// src/api/webhooks/lemonsqueezy.ts
export async function POST(req: NextRequest) {
  // Verify webhook signature
  // Update user.isPro = true
  // Send confirmation email
}
```

## Recommended Approach

1. **Start with LemonSqueezy** - easiest setup, great international support
2. **Keep PayPal as backup** - some users prefer it
3. **Add Stripe later** - when you need more control

## Troubleshooting

### Common Issues:
- **Currency not supported**: LemonSqueezy handles 135+ currencies automatically
- **Payment declined**: Usually due to bank restrictions, not your setup
- **High fees**: Consider Paddle for better rates at scale

### Support:
- LemonSqueezy: [help.lemonsqueezy.com](https://help.lemonsqueezy.com)
- Gumroad: [help.gumroad.com](https://help.gumroad.com)
- Paddle: [paddle.com/support](https://paddle.com/support)

## Next Steps

1. Choose your preferred payment processor
2. Update the URLs in the code
3. Test with a small amount first
4. Monitor transactions and user feedback
5. Consider adding webhook integration for automatic upgrades 