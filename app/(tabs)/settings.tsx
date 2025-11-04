import { FloatingNavigation } from '@/components/FloatingNavigation';
import { HapticService } from '@/services/HapticService';
import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'select' | 'link' | 'button';
  icon?: string;
  value?: boolean | string;
  options?: { label: string; value: string }[];
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  // WALKING MODE POLISH: Default to walking mode
  const [transportMode, setTransportMode] = useState<'driving' | 'walking' | 'transit'>('walking');

  const handleFeedback = async () => {
    await HapticService.mediumImpact();
    Alert.alert(
      'Send Feedback',
      'Thank you for using Detour! We\'d love to hear your thoughts.',
      [
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:feedback@detour.app?subject=Detour%20Feedback');
          },
        },
        {
          text: 'Rate App',
          onPress: () => {
            // Open app store rating
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleAbout = async () => {
    await HapticService.mediumImpact();
    Alert.alert(
      'About Detour',
      'Detour v1.0.0\n\nDiscover amazing routes and hidden gems along your journey.',
      [{ text: 'OK' }]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'NAVIGATION',
      items: [
        {
          id: 'transport-mode',
          title: 'Preferred Transport',
          subtitle: transportMode.charAt(0).toUpperCase() + transportMode.slice(1),
          type: 'select',
          icon: 'car',
          options: [
            { label: 'Driving', value: 'driving' },
            { label: 'Walking', value: 'walking' },
            { label: 'Transit', value: 'transit' },
          ],
          onPress: async () => {
            await HapticService.mediumImpact();
            Alert.alert('Select Transport Mode', '', [
              {
                text: 'Driving',
                onPress: async () => {
                  await HapticService.success();
                  setTransportMode('driving');
                },
              },
              {
                text: 'Walking',
                onPress: async () => {
                  await HapticService.success();
                  setTransportMode('walking');
                },
              },
              {
                text: 'Transit',
                onPress: async () => {
                  await HapticService.success();
                  setTransportMode('transit');
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]);
          },
        },
        {
          id: 'auto-save',
          title: 'Auto-save Routes',
          subtitle: 'Automatically save your detours',
          type: 'toggle',
          icon: 'save',
          value: autoSave,
          onValueChange: async (value) => {
            await HapticService.toggle(value);
            setAutoSave(value);
          },
        },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Get alerts for nearby POIs',
          type: 'toggle',
          icon: 'notifications',
          value: notifications,
          onValueChange: async (value) => {
            await HapticService.toggle(value);
            setNotifications(value);
          },
        },
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Currently enabled',
          type: 'toggle',
          icon: 'moon',
          value: darkMode,
          onValueChange: async (value) => {
            await HapticService.toggle(value);
            setDarkMode(value);
          },
        },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        {
          id: 'version',
          title: 'Version',
          subtitle: '1.0.0',
          type: 'link',
          icon: 'information-circle',
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          type: 'link',
          icon: 'shield-checkmark',
          onPress: () => {
            Linking.openURL('https://detour.app/privacy');
          },
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          type: 'link',
          icon: 'document-text',
          onPress: () => {
            Linking.openURL('https://detour.app/terms');
          },
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          id: 'feedback',
          title: 'Send Feedback',
          type: 'button',
          icon: 'chatbubbles',
          onPress: handleFeedback,
        },
        {
          id: 'about',
          title: 'About Detour',
          type: 'button',
          icon: 'information-circle',
          onPress: handleAbout,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <View key={item.id} style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              {item.icon && (
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={theme.colors.accentLight}
                  />
                </View>
              )}
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <Switch
              value={item.value as boolean}
              onValueChange={item.onValueChange}
              trackColor={{ false: theme.colors.cardBorder, true: theme.colors.accentLight + '30' }}
              thumbColor={item.value ? theme.colors.accentLight : theme.colors.textTertiary}
            />
          </View>
        );

      case 'select':
      case 'link':
      case 'button':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingsItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingsItemLeft}>
              {item.icon && (
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={theme.colors.accentLight}
                  />
                </View>
              )}
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your Detour experience</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  {renderSettingsItem(item)}
                  {index < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Clear Cache Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STORAGE</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={async () => {
                await HapticService.mediumImpact();
                Alert.alert(
                  'Clear Cache',
                  'This will remove cached maps and images. Your saved detours will not be affected.',
                  [
                    {
                      text: 'Clear',
                      onPress: async () => {
                        await HapticService.success();
                        // Implement cache clearing
                        Alert.alert('Success', 'Cache cleared');
                      },
                      style: 'destructive',
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
                  <Ionicons
                    name="trash"
                    size={20}
                    color={theme.colors.error}
                  />
                </View>
                <View style={styles.settingsItemContent}>
                  <Text style={[styles.settingsItemTitle, { color: theme.colors.error }]}>
                    Clear Cache
                  </Text>
                  <Text style={styles.settingsItemSubtitle}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by the Detour team
          </Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
      <FloatingNavigation bottomOffset={36} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkPrimary,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  sectionContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingsItemSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
});
