import { authLogger, securityLogger } from '../utils/logger';
import { SECURITY_CONFIG } from '../constants';
import { validateSiriusAccess } from '../utils/portalUtils';

export interface GroupChangeEvent {
  userId: string;
  username: string;
  groupId: string;
  groupName: string;
  action: 'added' | 'removed';
  timestamp: string;
}

export interface WebhookPayload {
  eventType: 'group_membership_changed';
  data: GroupChangeEvent;
  signature?: string; // For webhook verification
}

class WebhookService {
  private eventSource: EventSource | null = null;
  private onGroupAccessLost: (() => void) | null = null;
  private currentUserId: string | null = null;

  /**
   * Initialize webhook connection for real-time group change notifications
   */
  initialize(userId: string, onAccessLost: () => void): void {
    this.currentUserId = userId;
    this.onGroupAccessLost = onAccessLost;
    
    // Setup webhook endpoint or Server-Sent Events connection
    this.setupWebhookListener();
    
    authLogger.info('🔗 Webhook service initialized for user', { userId });
  }

  /**
   * Setup webhook listener - this can be either:
   * 1. Server-Sent Events (SSE) for real-time updates
   * 2. WebSocket connection
   * 3. Regular HTTP endpoint for webhook callbacks
   */
  private setupWebhookListener(): void {
    try {
      // Option 1: Server-Sent Events (recommended for portal notifications)
      if (process.env.REACT_APP_WEBHOOK_SSE_URL) {
        this.setupSSEConnection();
      }
      
      // Option 2: WebSocket connection
      else if (process.env.REACT_APP_WEBHOOK_WS_URL) {
        this.setupWebSocketConnection();
      }
      
      // Fallback: Register webhook callback URL with portal
      else {
        this.registerWebhookCallback();
      }
      
    } catch (error) {
      authLogger.error('Failed to setup webhook listener', error);
      // Fallback to minimal polling as backup
      this.setupFallbackPolling();
    }
  }

  /**
   * Setup Server-Sent Events connection for real-time updates
   */
  private setupSSEConnection(): void {
    const sseUrl = `${process.env.REACT_APP_WEBHOOK_SSE_URL}/group-changes/${this.currentUserId}`;
    
    this.eventSource = new EventSource(sseUrl);
    
    this.eventSource.onopen = () => {
      authLogger.info('📡 SSE connection established for group changes');
    };
    
    this.eventSource.onmessage = (event) => {
      try {
        const payload: WebhookPayload = JSON.parse(event.data);
        this.handleGroupChangeEvent(payload);
      } catch (error) {
        authLogger.error('Failed to parse SSE message', error);
      }
    };
    
    this.eventSource.onerror = (error) => {
      authLogger.error('SSE connection error', error);
      // Attempt to reconnect after delay
      setTimeout(() => {
        if (this.currentUserId && this.onGroupAccessLost) {
          this.setupSSEConnection();
        }
      }, 5000);
    };
  }

  /**
   * Setup WebSocket connection for real-time updates
   */
  private setupWebSocketConnection(): void {
    // WebSocket implementation for real-time group changes
    const wsUrl = `${process.env.REACT_APP_WEBHOOK_WS_URL}/group-changes`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      authLogger.info('🔌 WebSocket connected for group changes');
      // Subscribe to user-specific group changes
      ws.send(JSON.stringify({
        action: 'subscribe',
        userId: this.currentUserId
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const payload: WebhookPayload = JSON.parse(event.data);
        this.handleGroupChangeEvent(payload);
      } catch (error) {
        authLogger.error('Failed to parse WebSocket message', error);
      }
    };
    
    ws.onerror = (error) => {
      authLogger.error('WebSocket error', error);
    };
  }

  /**
   * Register webhook callback URL with ArcGIS Portal
   */
  private registerWebhookCallback(): void {
    // Register webhook URL with ArcGIS Portal for group change notifications
    const webhookUrl = `${window.location.origin}/api/webhooks/group-changes`;
    
    authLogger.info('📝 Registering webhook callback URL', { webhookUrl });
    
    // This would typically be done on the server-side
    // Frontend can trigger the registration through an API call
    fetch('/api/register-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl,
        events: ['group_membership_changed'],
        userId: this.currentUserId
      })
    }).catch(error => {
      authLogger.error('Failed to register webhook', error);
      this.setupFallbackPolling();
    });
  }

  /**
   * Handle incoming group change events
   */
  private handleGroupChangeEvent(payload: WebhookPayload): void {
    if (payload.eventType !== 'group_membership_changed') {
      return;
    }

    const event = payload.data;
    
    // Only process events for the current user
    if (event.userId !== this.currentUserId) {
      return;
    }

    authLogger.info('📢 Group change event received', event);

    // Check if this affects Sirius Users group access
    if (event.groupId === SECURITY_CONFIG.REQUIRED_GROUP_ID) {
      if (event.action === 'removed') {
        securityLogger.security('USER REMOVED FROM SIRIUS GROUP - WEBHOOK NOTIFICATION', {
          userId: event.userId,
          username: event.username,
          groupId: event.groupId,
          groupName: event.groupName,
          timestamp: event.timestamp
        });
        
        // Trigger access lost callback
        if (this.onGroupAccessLost) {
          this.onGroupAccessLost();
        }
      } else if (event.action === 'added') {
        authLogger.info('✅ User added back to Sirius group', event);
        // Optionally refresh user session to restore access
        this.refreshUserSession();
      }
    }
  }

  /**
   * Refresh user session when access is restored
   */
  private refreshUserSession(): void {
    // Trigger a session refresh to update user permissions
    window.dispatchEvent(new CustomEvent('sirius-access-restored'));
  }

  /**
   * Fallback polling mechanism (much less frequent than before)
   */
  private setupFallbackPolling(): void {
    authLogger.warn('🔄 Setting up fallback polling for group validation');
    
    // Only poll every 30 minutes as fallback
    setInterval(() => {
      this.checkGroupMembershipFallback();
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Fallback group membership check
   */
  private async checkGroupMembershipFallback(): Promise<void> {
    // Implementation for fallback group check
    // This is much less frequent and only as backup
    authLogger.debug('Performing fallback group membership check');
  }

  /**
   * Verify webhook signature for security
   */
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature verification
    // This ensures the webhook is coming from a trusted source
    const expectedSignature = this.calculateHMAC(payload);
    return signature === expectedSignature;
  }

  /**
   * Calculate HMAC signature for webhook verification
   */
  private calculateHMAC(payload: string): string {
    // Implementation depends on your webhook security setup
    // Typically using HMAC-SHA256 with a shared secret
    return 'calculated-signature';
  }

  /**
   * Clean up webhook connections
   */
  cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.currentUserId = null;
    this.onGroupAccessLost = null;
    
    authLogger.info('🧹 Webhook service cleaned up');
  }
}

export const webhookService = new WebhookService();