# Shoofi Real-Time Notification System

## Overview

This document describes the refactored real-time notification system for the Shoofi platform, which serves multiple applications:

1. **shoofi-app** (Customer mobile app)
2. **shoofi-partner** (Store manager mobile app)
3. **shoofi-shoofir** (Delivery driver mobile app)
4. **shoofi-delivery-web** (Admin web app)
5. **shoofi-server** (Backend server)

## Architecture

### Core Components

1. **Notification Service** (`shoofi-server/services/notification/notification-service.js`)
   - Centralized notification management
   - Multi-channel delivery (WebSocket, Push, Email, SMS)
   - Retry mechanisms and error handling
   - Database persistence

2. **WebSocket Service** (`shoofi-server/services/websocket/websocket-service.js`)
   - Real-time communication
   - Connection management and authentication
   - Room-based messaging
   - Heartbeat and cleanup mechanisms

3. **API Routes** (`shoofi-server/routes/notifications.js`)
   - RESTful endpoints for notification management
   - CRUD operations for notifications
   - Statistics and analytics

4. **Client Hooks**
   - React Native: `shoofi-app/hooks/use-notifications.ts`
   - Web: `shoofi-delivery-web/src/hooks/useNotifications.ts`

## Features

### ✅ Implemented Features

- **Multi-channel Notifications**: WebSocket, Push (Expo + Firebase), Email, SMS
- **Real-time Updates**: Instant delivery via WebSocket
- **Persistent Storage**: MongoDB collection with proper indexing
- **Authentication**: JWT-based WebSocket authentication
- **Connection Management**: Automatic reconnection, heartbeat, cleanup
- **Error Handling**: Comprehensive error handling and logging
- **Retry Mechanisms**: Automatic retry for failed deliveries
- **Statistics**: Notification analytics and metrics
- **Multi-language Support**: Template-based notifications
- **Scalability**: Room-based messaging and connection limits

### 🔄 Migration Features

- **Database Migration**: Automatic collection and index creation
- **User Preferences**: Default notification preferences for existing users
- **Template System**: Predefined notification templates
- **Backward Compatibility**: Gradual migration from old system

## Installation & Setup

### 1. Install Dependencies

```bash
cd shoofi-server
npm install winston jsonwebtoken expo-server-sdk firebase-admin
```

### 2. Environment Variables

Add to your `.env` file:

```env
# JWT Secret for WebSocket authentication
JWT_SECRET=your-jwt-secret-here

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your-expo-access-token

# Firebase Admin (for web push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000
WS_CONNECTION_TIMEOUT=60000
WS_MAX_CONNECTIONS_PER_USER=3
```

### 3. Database Migration

Run the migration script:

```javascript
const { createNotificationsCollection, updateUsersWithNotificationPreferences } = require('./utils/migrations/create-notifications-collection');

// In your app initialization
await createNotificationsCollection(db);
await updateUsersWithNotificationPreferences(db);
```

### 4. Update Client Apps

#### React Native Apps (shoofi-app, shoofi-partner, shoofi-shoofir)

Replace the old WebSocket implementation with the new hook:

```typescript
// Old implementation
import { useWebSocket } from 'react-use-websocket';
import { useWebSocketUrl } from '../hooks/use-web-socket-url';

// New implementation
import useNotifications from '../hooks/use-notifications';

const MyComponent = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    refreshNotifications,
    connectionStatus
  } = useNotifications();

  // Use the notification data
};
```

#### Web App (shoofi-delivery-web)

```typescript
import useNotifications from '../hooks/useNotifications';

const MyComponent = ({ customerData }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    requestPermission,
    connectionStatus
  } = useNotifications(customerData);

  // Use the notification data
};
```

## API Reference

### Notification Endpoints

#### Send Notification
```http
POST /api/notifications/send
Content-Type: application/json
app-name: your-app-name

{
  "recipientIds": ["user1", "user2"],
  "title": "Notification Title",
  "body": "Notification Body",
  "type": "order",
  "data": { "orderId": "123" },
  "channels": {
    "websocket": true,
    "push": true,
    "email": false,
    "sms": false
  }
}
```

#### Get User Notifications
```http
GET /api/notifications?limit=50&offset=0&unreadOnly=false
app-name: your-app-name
user-id: user-id
Authorization: Bearer token
```

#### Mark as Read
```http
PUT /api/notifications/{id}/read
app-name: your-app-name
Authorization: Bearer token
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
app-name: your-app-name
user-id: user-id
Authorization: Bearer token
```

#### Get Statistics
```http
GET /api/notifications/stats
app-name: your-app-name
user-id: user-id
Authorization: Bearer token
```

### WebSocket Events

#### Connection
```javascript
// Connect with authentication
const ws = new WebSocket(`ws://localhost:1111?customerId=${userId}&appName=${appName}&token=${jwtToken}`);

// Listen for connection events
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'notification') {
    // Handle new notification
  }
};
```

#### Send Messages
```javascript
// Join a room
ws.send(JSON.stringify({
  type: 'join_room',
  room: 'orders'
}));

// Send ping
ws.send(JSON.stringify({
  type: 'ping'
}));
```

## Usage Examples

### Sending Notifications from Server

```javascript
const notificationService = require('./services/notification/notification-service');

// Send to specific users
await notificationService.sendNotification({
  recipientId: 'user123',
  title: 'New Order',
  body: 'You have a new order #123',
  type: 'order',
  data: { orderId: '123' },
  appName: 'shoofi-app',
  channels: { websocket: true, push: true },
  req
});

// Send to all users in an app
await notificationService.sendNotification({
  recipientIds: ['user1', 'user2', 'user3'],
  title: 'System Maintenance',
  body: 'Scheduled maintenance in 1 hour',
  type: 'system',
  appName: 'shoofi-app',
  channels: { websocket: true, push: true, email: true },
  req
});
```

### Using WebSocket Service

```javascript
const websocketService = require('./services/websocket/websocket-service');

// Send to specific user
websocketService.sendToUser('user123', {
  type: 'order_update',
  data: { orderId: '123', status: 'delivered' }
}, 'shoofi-app');

// Send to all users in an app
websocketService.sendToApp('shoofi-app', {
  type: 'system_announcement',
  data: { message: 'System will be down for maintenance' }
});

// Send to admin users only
websocketService.sendToAppAdmins('shoofi-app', {
  type: 'admin_alert',
  data: { alert: 'High order volume detected' }
});
```

## Best Practices

### 1. Error Handling
- Always handle WebSocket connection errors
- Implement retry mechanisms for failed notifications
- Log errors for debugging

### 2. Performance
- Use pagination for notification lists
- Implement proper cleanup for old notifications
- Monitor WebSocket connection limits

### 3. Security
- Validate JWT tokens for WebSocket connections
- Sanitize notification content
- Implement rate limiting

### 4. User Experience
- Show connection status to users
- Provide notification preferences
- Handle offline scenarios gracefully

## Monitoring & Analytics

### WebSocket Statistics
```javascript
const stats = websocketService.getStats();
console.log(stats);
// {
//   totalConnections: 150,
//   totalRooms: 5,
//   connectionsByApp: { 'shoofi-app': 100, 'shoofi-partner': 50 },
//   connectionsByType: { user: 140, admin: 10 }
// }
```

### Notification Analytics
- Track delivery success rates
- Monitor user engagement
- Analyze notification preferences

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check JWT token validity
   - Verify app-name parameter
   - Check server logs for authentication errors

2. **Push Notifications Not Working**
   - Verify Expo/Firebase configuration
   - Check device token registration
   - Test with Expo push tool

3. **High Memory Usage**
   - Monitor WebSocket connections
   - Check for memory leaks in connection cleanup
   - Implement connection limits

### Debug Mode

Enable debug logging:

```javascript
// Set environment variable
NODE_ENV=development

// Check logs
tail -f shoofi-server/logs/combined.log
```

## Migration Guide

### From Old System

1. **Backup existing data**
2. **Run migration scripts**
3. **Update client code gradually**
4. **Test thoroughly**
5. **Monitor performance**

### Rollback Plan

1. Keep old WebSocket implementation as backup
2. Maintain backward compatibility during transition
3. Have rollback scripts ready

## Future Enhancements

- [ ] Notification templates with variables
- [ ] Advanced filtering and search
- [ ] Notification scheduling
- [ ] A/B testing for notifications
- [ ] Advanced analytics dashboard
- [ ] Notification preferences UI
- [ ] Bulk notification operations
- [ ] Notification categories and tags

## Support

For issues and questions:
1. Check the logs in `shoofi-server/logs/`
2. Review this documentation
3. Test with the provided examples
4. Contact the development team 