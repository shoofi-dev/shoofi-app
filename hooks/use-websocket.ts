import { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import useWebSocketLib, { ReadyState } from 'react-use-websocket';
import { StoreContext } from '../stores';
import { WS_URL } from '../consts/api';
import { APP_NAME, APP_TYPE } from '../consts/shared';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  error: string | null;
  reconnectAttempts: number;
}

interface UseWebSocketReturn extends WebSocketState {
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
  getStats: () => {
    totalMessages: number;
    totalErrors: number;
    uptime: number;
    lastConnectionTime: number | null;
  };
}

const useWebSocket = (): UseWebSocketReturn => {
  const { userDetailsStore, storeDataStore, authStore, shoofiAdminStore, cartStore } = useContext(StoreContext);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    connectionStatus: 'disconnected',
    lastMessage: null,
    error: null,
    reconnectAttempts: 0
  });

  const statsRef = useRef({
    totalMessages: 0,
    totalErrors: 0,
    uptime: 0,
    lastConnectionTime: null as number | null
  });
  const appState = useRef(AppState.currentState);
  const isOnline = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  // Configuration
  const maxReconnectAttempts = 10;
  const heartbeatInterval = 25000; // 25 seconds

  // Memoize WebSocket URL
  const webSocketUrl = useMemo(() => {
    if (!userDetailsStore.userDetails?.customerId || !authStore.userToken) {
      return null;
    }
    
    const appName = userDetailsStore.isAdmin() 
      ? (storeDataStore.storeData?.appName || APP_NAME)
      : APP_NAME;
    
    return `${WS_URL}?customerId=${userDetailsStore.userDetails.customerId}&appName=${appName}&token=${authStore.userToken}&appType=${APP_TYPE}`;
  }, [
    userDetailsStore.userDetails?.customerId,
    authStore.userToken,
    userDetailsStore.isAdmin(),
    storeDataStore.storeData?.appName
  ]);

  // Options for react-use-websocket
  const options = useMemo(() => ({
    shouldReconnect: (closeEvent: CloseEvent) => {
      // Don't reconnect on normal closure
      if (closeEvent.code === 1000) {
        return false;
      }
      // Don't reconnect if max attempts reached or offline
      if (reconnectAttemptsRef.current >= maxReconnectAttempts || !isOnline.current) {
        return false;
      }
      reconnectAttemptsRef.current++;
      return true;
    },
    reconnectAttempts: maxReconnectAttempts,
    reconnectInterval: (attemptNumber: number) => {
      const baseDelay = 1000; // 1 second
      const maxDelay = 30000; // 30 seconds
      const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
      // Add jitter to prevent thundering herd
      return delay + Math.random() * 1000;
    },
    heartbeat: {
      message: JSON.stringify({ type: 'ping', data: { timestamp: Date.now() } }),
      returnMessage: JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }),
      timeout: heartbeatInterval,
    },
    // Prevent duplicate messages by ensuring single connection
    share: false,
    onOpen: () => {
      statsRef.current.lastConnectionTime = Date.now();
      reconnectAttemptsRef.current = 0;
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        connectionStatus: 'connected',
        reconnectAttempts: 0,
        error: null
      }));
    },
    onClose: (event: CloseEvent) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionStatus: event.code === 1000 ? 'disconnected' : 'error',
        error: event.code === 1000 ? null : 'Connection closed unexpectedly'
      }));
    },
    onError: (error: Event) => {
      console.error('WebSocket error:', error);
      statsRef.current.totalErrors++;
      setState(prev => ({
        ...prev,
        error: 'Connection error'
      }));
    },
    onMessage: async (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        statsRef.current.totalMessages++;
        
        // Handle pong response
        if (message.type === 'pong') {
          setState(prev => ({
            ...prev,
            error: null
          }));
        }
        if (message.type === 'store_refresh' || message.type === 'store_updated') {
          // Check if the message is for the current app
          const cartStoreDBName = await cartStore.getCartStoreDBName();
          if(cartStoreDBName && message.data?.appName !== cartStoreDBName){
            if (message.data?.appName === cartStoreDBName) {
              // Refresh the store data
              storeDataStore.getStoreData();
            }
          }

          if (message.data?.appName === storeDataStore.storeData?.appName) {
            // Refresh the store data
            storeDataStore.getStoreData();
          }
        }
        if (message.type === 'shoofi_store_updated') {
          // Check if the message is for the current app
            // Refresh the store data
          shoofiAdminStore.getStoreData();

        }
        if (message.type === 'ads_updated') {
          // Handle ads updates - trigger refresh of ads data
          console.log('Ads updated:', message.data);
          // You can emit an event or call a callback to refresh ads
          // For now, we'll just log it
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        statsRef.current.totalErrors++;
      }
    },
    onReconnectStop: (numAttempts: number) => {
      setState(prev => ({
        ...prev,
        isReconnecting: false,
        connectionStatus: 'error',
        error: numAttempts >= maxReconnectAttempts 
          ? 'Max reconnection attempts reached' 
          : 'Network offline'
      }));
    }
  }), [maxReconnectAttempts, heartbeatInterval]);

  // Use react-use-websocket
  const {
    sendMessage: sendRawMessage,
    readyState,
    getWebSocket,
    lastMessage,
    lastJsonMessage
  } = useWebSocketLib(webSocketUrl, options);

  // Update state based on readyState
  useEffect(() => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        setState(prev => ({
          ...prev,
          isConnecting: true,
          connectionStatus: 'connecting'
        }));
        break;
      case ReadyState.OPEN:
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          connectionStatus: 'connected'
        }));
        break;
      case ReadyState.CLOSING:
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionStatus: 'disconnected'
        }));
        break;
      case ReadyState.CLOSED:
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          connectionStatus: 'disconnected'
        }));
        break;
    }
  }, [readyState]);

  // Update lastMessage when it changes
  useEffect(() => {
    if (lastJsonMessage) {
      setState(prev => ({
        ...prev,
        lastMessage: lastJsonMessage as WebSocketMessage
      }));
    }
  }, [lastJsonMessage]);

  // Send message to WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (readyState === ReadyState.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: Date.now()
        };
        sendRawMessage(JSON.stringify(messageWithTimestamp));
        statsRef.current.totalMessages++;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        statsRef.current.totalErrors++;
      }
    } else {
      console.warn('WebSocket is not connected, message not sent');
    }
  }, [sendRawMessage, readyState]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setState(prev => ({
      ...prev,
      reconnectAttempts: 0,
      error: null
    }));
    // Close current connection to trigger reconnection
    const ws = getWebSocket();
    if (ws) {
      ws.close();
    }
  }, [getWebSocket]);

  // Manual disconnect
  const disconnect = useCallback(() => {
    const ws = getWebSocket();
    if (ws) {
      ws.close(1000, 'Manual disconnect');
    }
    reconnectAttemptsRef.current = 0;
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      connectionStatus: 'disconnected',
      reconnectAttempts: 0
    }));
  }, [getWebSocket]);

  // Get connection stats
  const getStats = useCallback(() => {
    const now = Date.now();
    return {
      ...statsRef.current,
      uptime: statsRef.current.lastConnectionTime 
        ? now - statsRef.current.lastConnectionTime 
        : 0
    };
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, reconnect if needed
        if (readyState === ReadyState.CLOSED && isOnline.current) {
          reconnect();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background, disconnect to save battery
        disconnect();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [readyState, reconnect, disconnect]);

  // Handle network state changes
  useEffect(() => {
    const handleNetworkChange = (networkState: any) => {
      isOnline.current = networkState.isConnected;
      
      if (networkState.isConnected) {
        // Network came back online, try to reconnect
        if (readyState === ReadyState.CLOSED) {
          reconnect();
        }
      } else {
        // Network went offline, disconnect
        disconnect();
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    return () => unsubscribe();
  }, [readyState, reconnect, disconnect]);

  return {
    ...state,
    sendMessage,
    reconnect,
    disconnect,
    getStats
  };
};

export default useWebSocket; 