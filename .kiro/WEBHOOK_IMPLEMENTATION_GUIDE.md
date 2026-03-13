# Webhook Implementation Guide

## Overview
The webhook system is now fully implemented and ready to receive events from external CRM systems like n8N.

## Step 1: Apply Database Migrations

Run the SQL migration to create the required tables in Supabase:

```sql
-- File: server/migrations/webhook_events.sql
-- Copy and paste this into Supabase SQL Editor
```

**Tables created:**
- `webhook_events` - Stores all incoming webhook events
- `webhook_configs` - Stores webhook configuration and credentials
- `webhook_attempts` - Tracks retry attempts for failed webhooks

## Step 2: Set Environment Variables

Add to your `.env` file:

```env
WEBHOOK_TOKEN=your-secure-token-here
```

Generate a secure token:
```bash
node -e "console.log(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))"
```

## Step 3: API Endpoints

### Receive Webhook Events
**POST** `/api/webhooks/events`

Headers:
```
x-webhook-token: <your-token>
Content-Type: application/json
```

Body example:
```json
{
  "event_type": "customer.created",
  "source_system": "n8N",
  "payload": {
    "id": "123",
    "name": "Empresa XYZ",
    "contact_name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "11987654321",
    "source": "crm"
  }
}
```

### Manage Webhook Configs
**GET** `/api/webhooks/config` - List all configs
**POST** `/api/webhooks/config` - Create new config
**PUT** `/api/webhooks/config` - Update config
**DELETE** `/api/webhooks/config` - Delete config

## Step 4: Configure n8N CRM

1. In n8N, create a new workflow
2. Add a Webhook node
3. Set the URL to: `https://your-domain.com/api/webhooks/events`
4. Add header: `x-webhook-token: <your-token>`
5. Configure events to send:
   - customer.created
   - customer.updated
   - customer.deleted
   - payment.received
   - payment.failed

## Step 5: Supported Events

### Customer Events
- `customer.created` - Creates a new company in the system
- `customer.updated` - Updates existing company data
- `customer.deleted` - Removes company from system

### Payment Events
- `payment.received` - Marks payment as paid
- `payment.failed` - Records payment failure

## Step 6: Monitor Webhook Events

View received events in Supabase:
1. Go to SQL Editor
2. Run: `SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 50`
3. Check `processed` column to see if events were handled

## Troubleshooting

### Events not being received
- Verify `WEBHOOK_TOKEN` environment variable is set
- Check that token matches in n8N configuration
- Verify URL is correct and accessible

### Events received but not processed
- Check `webhook_events` table for errors
- Review server logs for processing errors
- Verify database tables exist (run migrations)

### Data not syncing
- Ensure `external_id` field is set in payload
- Check that company/payment records exist in database
- Verify field mappings match your schema

## Files Modified
- `server/api/webhooks/events.post.ts` - Main webhook endpoint
- `server/api/webhooks/config.ts` - Configuration management
- `server/migrations/webhook_events.sql` - Database schema
- `.env` - Environment variables

## Next Steps
1. Apply the SQL migration to Supabase
2. Set the WEBHOOK_TOKEN environment variable
3. Configure n8N to send events to your webhook URL
4. Test by sending a sample event
5. Monitor the webhook_events table for incoming data
