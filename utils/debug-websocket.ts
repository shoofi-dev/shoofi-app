// WebSocket debugging utility
class WebSocketDebugger {
  private static instance: WebSocketDebugger;
  private eventLog: Array<{
    type: string;
    data: any;
    timestamp: number;
    source: string;
  }> = [];
  private maxLogSize = 50;

  static getInstance(): WebSocketDebugger {
    if (!WebSocketDebugger.instance) {
      WebSocketDebugger.instance = new WebSocketDebugger();
    }
    return WebSocketDebugger.instance;
  }

  logEvent(type: string, data: any, source: string = 'unknown') {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      source
    };

    this.eventLog.push(event);

    // Keep log size manageable
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    console.log(`[WebSocket Debug] ${source}: ${type}`, data);
  }

  getRecentEvents(type?: string, limit: number = 10) {
    let events = this.eventLog;
    if (type) {
      events = events.filter(e => e.type === type);
    }
    return events.slice(-limit);
  }

  detectInfiniteLoop(type: string, timeWindow: number = 5000): boolean {
    const recentEvents = this.eventLog.filter(e => 
      e.type === type && 
      Date.now() - e.timestamp < timeWindow
    );

    return recentEvents.length > 5; // More than 5 events in 5 seconds indicates a loop
  }

  clearLog() {
    this.eventLog = [];
  }

  getStats() {
    const now = Date.now();
    const recentEvents = this.eventLog.filter(e => now - e.timestamp < 60000); // Last minute
    
    return {
      totalEvents: this.eventLog.length,
      recentEvents: recentEvents.length,
      byType: recentEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const wsDebugger = WebSocketDebugger.getInstance(); 