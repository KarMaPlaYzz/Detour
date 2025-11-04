import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Service
 * Provides haptic feedback responses for user interactions
 */
export class HapticService {
  /**
   * Light tap feedback - for subtle selections
   */
  static async lightTap(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Medium impact - for button presses
   */
  static async mediumImpact(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Heavy impact - for significant actions
   */
  static async heavyImpact(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Success notification - for confirmations
   */
  static async success(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Warning notification - for cautions
   */
  static async warning(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Error notification - for failures
   */
  static async error(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Selection feedback - for item selection
   */
  static async selection(): Promise<void> {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Soft impact - for gentle interactions
   */
  static async softImpact(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Double tap pattern
   */
  static async doubleTap(): Promise<void> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }

  /**
   * Toggle haptic - for toggles and switches
   */
  static async toggle(value: boolean): Promise<void> {
    try {
      if (value) {
        await this.success();
      } else {
        await this.warning();
      }
    } catch (error) {
      console.warn('Haptic feedback not available');
    }
  }
}
