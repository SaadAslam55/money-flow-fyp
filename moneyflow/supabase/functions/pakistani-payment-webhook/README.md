# Pakistani Payment Webhook Handler

This edge function handles webhooks from Pakistani payment providers:
- JazzCash
- EasyPaisa
- Raast

## Endpoints

- `POST /pakistani-payment-webhook/jazzcash` - JazzCash webhook handler
- `POST /pakistani-payment-webhook/easypaisa` - EasyPaisa webhook handler
- `POST /pakistani-payment-webhook/raast` - Raast webhook handler

## Configuration

Set webhook URLs in your payment provider dashboards:

1. **JazzCash**: Set return URL to `https://your-project.supabase.co/functions/v1/pakistani-payment-webhook/jazzcash`
2. **EasyPaisa**: Set postback URL to `https://your-project.supabase.co/functions/v1/pakistani-payment-webhook/easypaisa`
3. **Raast**: Set webhook URL to `https://your-project.supabase.co/functions/v1/pakistani-payment-webhook/raast`

## Security

- All webhooks are logged in `payment_webhooks` table
- Hash verification is performed for JazzCash and EasyPaisa
- Transactions are matched by `transaction_reference`
- Failed webhooks can be retried manually

## Deployment

```bash
supabase functions deploy pakistani-payment-webhook
```

