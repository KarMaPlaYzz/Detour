/**
 * Centralized UI State Management System
 * Tracks all open UI elements and provides easy dismissal/reset functionality
 */

import React from 'react';

export interface UIState {
  // Bottom Sheets
  poiBottomSheet: {
    isVisible: boolean;
    data: any[];
    selectedItem: any | null;
  };
  filterSheet: {
    isVisible: boolean;
    filters: any;
  };
  routeDetailsSheet: {
    isVisible: boolean;
    data: any | null;
  };
  saveModal: {
    isVisible: boolean;
  };
  
  // Other UI States
  selectedPOI: any | null;
  elevationProfile: any | null;
  isLoading: boolean;
}

export const initialUIState: UIState = {
  poiBottomSheet: {
    isVisible: false,
    data: [],
    selectedItem: null,
  },
  filterSheet: {
    isVisible: false,
    filters: {},
  },
  routeDetailsSheet: {
    isVisible: false,
    data: null,
  },
  saveModal: {
    isVisible: false,
  },
  selectedPOI: null,
  elevationProfile: null,
  isLoading: false,
};

export class UIStateManager {
  private static instance: UIStateManager;
  private listeners: Set<(state: UIState) => void> = new Set();
  private currentState: UIState = { ...initialUIState };

  private constructor() {}

  static getInstance(): UIStateManager {
    if (!UIStateManager.instance) {
      UIStateManager.instance = new UIStateManager();
    }
    return UIStateManager.instance;
  }

  // Subscribe to state changes
  subscribe(listener: (state: UIState) => void) {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): UIState {
    return { ...this.currentState };
  }

  // Update specific UI element
  updateUI(updates: Partial<UIState>) {
    this.currentState = {
      ...this.currentState,
      ...updates,
    };
    this.notifyListeners();
  }

  // Show POI Bottom Sheet
  showPOIBottomSheet(data: any[], selectedItem?: any) {
    this.updateUI({
      poiBottomSheet: {
        isVisible: true,
        data,
        selectedItem: selectedItem || null,
      },
    });
  }

  // Hide POI Bottom Sheet
  hidePOIBottomSheet() {
    this.updateUI({
      poiBottomSheet: {
        isVisible: false,
        data: [],
        selectedItem: null,
      },
    });
  }

  // Show Filter Sheet
  showFilterSheet(filters: any) {
    this.updateUI({
      filterSheet: {
        isVisible: true,
        filters,
      },
    });
  }

  // Hide Filter Sheet
  hideFilterSheet() {
    this.updateUI({
      filterSheet: {
        isVisible: false,
        filters: {},
      },
    });
  }

  // Show Route Details Sheet
  showRouteDetailsSheet(data: any) {
    this.updateUI({
      routeDetailsSheet: {
        isVisible: true,
        data,
      },
    });
  }

  // Hide Route Details Sheet
  hideRouteDetailsSheet() {
    this.updateUI({
      routeDetailsSheet: {
        isVisible: false,
        data: null,
      },
    });
  }

  // Show Save Modal
  showSaveModal() {
    this.updateUI({
      saveModal: {
        isVisible: true,
      },
    });
  }

  // Hide Save Modal
  hideSaveModal() {
    this.updateUI({
      saveModal: {
        isVisible: false,
      },
    });
  }

  // Set Selected POI
  setSelectedPOI(poi: any) {
    this.updateUI({
      selectedPOI: poi,
    });
  }

  // Set Loading State
  setLoading(isLoading: boolean) {
    this.updateUI({
      isLoading,
    });
  }

  // Set Elevation Profile
  setElevationProfile(profile: any) {
    this.updateUI({
      elevationProfile: profile,
    });
  }

  // Dismiss all UI elements
  dismissAll() {
    console.log('[UIStateManager] Dismissing all UI elements');
    this.currentState = { ...initialUIState };
    this.notifyListeners();
  }

  // Dismiss all sheets (keep data states)
  dismissAllSheets() {
    console.log('[UIStateManager] Dismissing all sheets');
    this.updateUI({
      poiBottomSheet: {
        ...this.currentState.poiBottomSheet,
        isVisible: false,
      },
      filterSheet: {
        ...this.currentState.filterSheet,
        isVisible: false,
      },
      routeDetailsSheet: {
        ...this.currentState.routeDetailsSheet,
        isVisible: false,
      },
      saveModal: {
        isVisible: false,
      },
    });
  }

  // Get list of open UI elements
  getOpenElements(): string[] {
    const open: string[] = [];
    
    if (this.currentState.poiBottomSheet.isVisible) open.push('POI Bottom Sheet');
    if (this.currentState.filterSheet.isVisible) open.push('Filter Sheet');
    if (this.currentState.routeDetailsSheet.isVisible) open.push('Route Details Sheet');
    if (this.currentState.saveModal.isVisible) open.push('Save Modal');
    if (this.currentState.selectedPOI) open.push('Selected POI');
    if (this.currentState.isLoading) open.push('Loading State');
    
    return open;
  }

  // Debug: Log current state
  logState() {
    console.log('[UIStateManager] Current State:', {
      openElements: this.getOpenElements(),
      state: this.currentState,
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

// Hook for React components
export const useUIState = () => {
  const [state, setState] = React.useState<UIState>(UIStateManager.getInstance().getState());
  
  React.useEffect(() => {
    const unsubscribe = UIStateManager.getInstance().subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    state,
    manager: UIStateManager.getInstance(),
  };
};

// Export singleton instance
export const uiStateManager = UIStateManager.getInstance();