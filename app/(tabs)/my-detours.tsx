import React from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingNavigation } from '@/components/FloatingNavigation';
import MapViewComponent from '@/components/MapViewComponent';
import { decode } from '@/services/PolylineDecoder';
import { listDetoursLocal, removeDetourLocal } from '@/services/StorageService';
import { theme } from '@/styles/theme';
import { SavedDetour } from '@/types/detour';

export default function MyDetoursScreen() {
  const [detours, setDetours] = React.useState<SavedDetour[]>([]);
  const [selectedDetour, setSelectedDetour] = React.useState<SavedDetour | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    loadDetours();
  }, []);

  // Refresh when screen comes into focus
  React.useEffect(() => {
    const interval = setInterval(() => {
      loadDetours();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDetours = async () => {
    try {
      const loaded = await listDetoursLocal();
      setDetours(loaded);
    } catch (error) {
      console.error('Error loading detours:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDetours();
    setRefreshing(false);
  };

  const handleDelete = (detour: SavedDetour) => {
    Alert.alert(
      'Delete Detour',
      `Are you sure you want to delete "${detour.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDetourLocal(detour.id);
              await loadDetours();
              if (selectedDetour?.id === detour.id) {
                setSelectedDetour(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete detour');
            }
          },
        },
      ]
    );
  };

  const handleViewDetour = (detour: SavedDetour) => {
    setSelectedDetour(detour);
  };

  const renderDetourItem = ({ item }: { item: SavedDetour }) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.detourCard}
        onPress={() => handleViewDetour(item)}
      >
        <View style={styles.detourHeader}>
          <View style={styles.detourInfo}>
            <Text style={styles.detourName}>{item.name}</Text>
            <Text style={styles.detourMeta}>
              {item.interest} • {formattedDate}
            </Text>
            <Text style={styles.detourPoi}>📍 {item.poi.name}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Detours Yet</Text>
      <Text style={styles.emptyText}>
        Create your first detour in the Explore tab!
      </Text>
    </View>
  );

  const selectedCoordinates = selectedDetour
    ? decode(selectedDetour.encodedPolyline)
    : undefined;

  const selectedMarkers = selectedDetour
    ? [
        {
          latitude: selectedDetour.startLocation.latitude,
          longitude: selectedDetour.startLocation.longitude,
          title: 'Start',
        },
        {
          latitude: selectedDetour.poi.location.latitude,
          longitude: selectedDetour.poi.location.longitude,
          title: selectedDetour.poi.name,
          description: selectedDetour.poi.vicinity,
        },
        {
          latitude: selectedDetour.endLocation.latitude,
          longitude: selectedDetour.endLocation.longitude,
          title: 'End',
        },
      ]
    : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Detours</Text>
        <Text style={styles.subtitle}>{detours.length} saved</Text>
      </View>

      <FlatList
        data={detours}
        renderItem={renderDetourItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Detail Modal */}
      <Modal
        visible={selectedDetour !== null}
        animationType="slide"
        onRequestClose={() => setSelectedDetour(null)}
      >
        <View style={styles.modalContainer}>
          <MapViewComponent
            coordinates={selectedCoordinates}
            markers={selectedMarkers}
          />
          
          <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedDetour?.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedDetour?.interest} • {selectedDetour?.poi.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedDetour(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <FloatingNavigation bottomOffset={36} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  detourCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  detourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  detourInfo: {
    flex: 1,
  },
  detourName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  detourMeta: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detourPoi: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
  },
  statusBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    height: 28,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  closeButton: {
    backgroundColor: theme.colors.background,
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});
