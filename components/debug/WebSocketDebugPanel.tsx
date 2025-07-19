import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { wsDebugger } from '../../utils/debug-websocket';

interface WebSocketDebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const WebSocketDebugPanel: React.FC<WebSocketDebugPanelProps> = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState(wsDebugger.getStats());
  const [recentEvents, setRecentEvents] = useState(wsDebugger.getRecentEvents());

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStats(wsDebugger.getStats());
      setRecentEvents(wsDebugger.getRecentEvents());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebSocket Debug Panel</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics (Last Minute)</Text>
          <Text style={styles.stat}>Total Events: {stats.totalEvents}</Text>
          <Text style={styles.stat}>Recent Events: {stats.recentEvents}</Text>
          {Object.entries(stats.byType).map(([type, count]) => (
            <Text key={type} style={styles.stat}>
              {type}: {count}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {recentEvents.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventSource}>{event.source}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            wsDebugger.clearLog();
            setStats(wsDebugger.getStats());
            setRecentEvents(wsDebugger.getRecentEvents());
          }}
        >
          <Text style={styles.clearButtonText}>Clear Log</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 300,
    height: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stat: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    marginBottom: 5,
    borderRadius: 4,
  },
  eventType: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventSource: {
    color: '#ccc',
    fontSize: 10,
  },
  eventTime: {
    color: '#999',
    fontSize: 10,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default WebSocketDebugPanel; 