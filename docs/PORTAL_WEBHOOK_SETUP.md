# ArcGIS Portal Enterprise Webhook Configuration

This document outlines the steps required to configure ArcGIS Portal Enterprise to send real-time webhook notifications for group membership changes.

## Overview

ArcGIS Portal Enterprise supports webhooks for various events, including user and group management changes. We'll configure it to notify our application when users are added or removed from the "Sirius Users" group.

## Prerequisites

- ArcGIS Portal Enterprise 10.8+ (webhooks introduced in 10.8)
- Portal Administrator access
- A publicly accessible webhook endpoint (your server)
- SSL certificate for webhook endpoint (HTTPS required)

## Step 1: Portal Administrator Setup

### 1.1 Access Portal Admin Directory

1. Navigate to: `https://your-portal.com/portal/portaladmin`
2. Sign in with Portal Administrator credentials
3. Go to **System** → **Webhooks**

### 1.2 Check Webhook Support

Verify your portal version supports webhooks:
```
GET https://your-portal.com/portal/sharing/rest/portals/self
```

Look for `"webhooks": true` in the response.

## Step 2: Create Webhook Endpoints

### 2.1 Set Up Webhook Receiver Server

You need a server endpoint to receive webhook notifications. Here's an example Node.js/Express setup:

```javascript
// webhook-server.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Webhook endpoint for group membership changes
app.post('/webhook/group-changes', (req, res) => {
  // Verify webhook signature (recommended)
  const signature = req.headers['x-esri-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;
  console.log('Group change event received:', event);

  // Process the event
  handleGroupChange(event);
  
  res.status(200).send('OK');
});

function verifySignature(payload, signature) {
  const secret = process.env.WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

function handleGroupChange(event) {
  // Forward to connected clients via SSE or WebSocket
  // This is where you'd notify your React app
}

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});
```

### 2.2 Deploy Webhook Server

Deploy your webhook server to a publicly accessible URL with HTTPS:
- `https://your-webhook-server.com/webhook/group-changes`

## Step 3: Register Webhooks with Portal

### 3.1 Using Portal Admin API

Register the webhook using the REST API:

```bash
curl -X POST "https://your-portal.com/portal/sharing/rest/portals/self/webhooks" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=SiriusGroupChanges" \
  -d "url=https://your-webhook-server.com/webhook/group-changes" \
  -d "events=groups.membership.changed" \
  -d "active=true" \
  -d "secret=your-webhook-secret-key" \
  -d "f=json" \
  -d "token=YOUR_ADMIN_TOKEN"
```

### 3.2 Using Portal Admin Directory (Alternative)

1. Go to: `https://your-portal.com/portal/portaladmin/system/webhooks`
2. Click **Register Webhook**
3. Fill in the form:
   - **Name**: `SiriusGroupChanges`
   - **URL**: `https://your-webhook-server.com/webhook/group-changes`
   - **Events**: `groups.membership.changed`
   - **Active**: `true`
   - **Secret**: `your-webhook-secret-key`

### 3.3 Webhook Configuration Parameters

```json
{
  "name": "SiriusGroupChanges",
  "url": "https://your-webhook-server.com/webhook/group-changes",
  "events": [
    "groups.membership.changed",
    "groups.membership.added", 
    "groups.membership.removed"
  ],
  "active": true,
  "secret": "your-webhook-secret-key",
  "filters": {
    "groupId": "afa4ae2949554ec59972abebbfd0034c"
  }
}
```

## Step 4: Configure Event Filters (Optional but Recommended)

### 4.1 Filter by Specific Group

To only receive notifications for the "Sirius Users" group:

```bash
curl -X POST "https://your-portal.com/portal/sharing/rest/portals/self/webhooks" \
  -d "filters={\"groupId\":\"afa4ae2949554ec59972abebbfd0034c\"}" \
  # ... other parameters
```

### 4.2 Filter by Event Type

Available group-related events:
- `groups.membership.changed` - Any membership change
- `groups.membership.added` - User added to group
- `groups.membership.removed` - User removed from group
- `groups.created` - Group created
- `groups.deleted` - Group deleted
- `groups.updated` - Group properties changed

## Step 5: Webhook Payload Format

Your webhook endpoint will receive payloads like this:

```json
{
  "eventType": "groups.membership.removed",
  "timestamp": "2025-01-09T10:30:00Z",
  "portalUrl": "https://your-portal.com/portal",
  "data": {
    "groupId": "afa4ae2949554ec59972abebbfd0034c",
    "groupName": "Sirius Users",
    "userId": "user123",
    "username": "john.doe",
    "action": "removed",
    "adminUsername": "admin.user"
  },
  "signature": "sha256=abc123..."
}
```

## Step 6: Server-Sent Events (SSE) Setup

### 6.1 SSE Endpoint for Real-time Updates

Add an SSE endpoint to your webhook server:

```javascript
// SSE endpoint for real-time updates to browser clients
app.get('/sse/group-changes/:userId', (req, res) => {
  const userId = req.params.userId;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Store client connection for this user
  clients.set(userId, res);

  req.on('close', () => {
    clients.delete(userId);
  });
});

// Function to send events to specific user
function notifyUser(userId, eventData) {
  const client = clients.get(userId);
  if (client) {
    client.write(`data: ${JSON.stringify(eventData)}\n\n`);
  }
}

// Call this from your webhook handler
function handleGroupChange(event) {
  if (event.data.userId) {
    notifyUser(event.data.userId, event);
  }
}
```

## Step 7: Testing the Webhook

### 7.1 Test Webhook Registration

Verify your webhook is registered:

```bash
curl "https://your-portal.com/portal/sharing/rest/portals/self/webhooks?f=json&token=YOUR_TOKEN"
```

### 7.2 Test Group Membership Changes

1. Add/remove a user from the "Sirius Users" group
2. Check your webhook server logs for incoming notifications
3. Verify your React app receives real-time updates

### 7.3 Monitor Webhook Status

Check webhook delivery status:

```bash
curl "https://your-portal.com/portal/sharing/rest/portals/self/webhooks/WEBHOOK_ID/deliveries?f=json&token=YOUR_TOKEN"
```

## Step 8: Production Considerations

### 8.1 Security

- Always use HTTPS for webhook endpoints
- Implement signature verification
- Use strong webhook secrets
- Validate incoming payloads
- Rate limit webhook endpoints

### 8.2 Reliability

- Implement retry logic for failed deliveries
- Store webhook events for audit trails
- Monitor webhook delivery success rates
- Have fallback mechanisms

### 8.3 Scaling

- Use message queues for high-volume environments
- Implement horizontal scaling for webhook servers
- Use load balancers for webhook endpoints
- Consider using cloud services (AWS SNS, Azure Event Grid)

## Troubleshooting

### Common Issues

1. **Webhooks not firing**:
   - Check portal version (10.8+ required)
   - Verify webhook is active
   - Check event filters
   - Ensure endpoint is accessible

2. **SSL/TLS errors**:
   - Webhook endpoints must use valid SSL certificates
   - Portal must trust the certificate chain

3. **Signature verification fails**:
   - Ensure webhook secret matches
   - Check signature calculation algorithm
   - Verify payload encoding

### Testing Commands

```bash
# List all webhooks
curl "https://your-portal.com/portal/sharing/rest/portals/self/webhooks?f=json&token=TOKEN"

# Test webhook endpoint
curl -X POST "https://your-webhook-server.com/webhook/group-changes" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Delete webhook (if needed)
curl -X DELETE "https://your-portal.com/portal/sharing/rest/portals/self/webhooks/WEBHOOK_ID?token=TOKEN"
```

## Alternative: Polling-based Fallback

If webhook setup is complex, the system will automatically fall back to polling every 30 minutes, which is much less aggressive than the previous 5-minute polling and shouldn't cause navigation issues.

## Next Steps

1. Set up webhook receiver server
2. Deploy to production with HTTPS
3. Register webhook with Portal
4. Test group membership changes
5. Monitor webhook delivery logs
6. Update your `.env` file with webhook URLs

This webhook approach will provide real-time updates and eliminate the polling-related authentication issues you were experiencing during navigation.