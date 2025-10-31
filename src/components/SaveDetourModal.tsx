import { theme } from '@/styles/theme';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SaveDetourModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  poiName?: string;
}

export default function SaveDetourModal({
  visible,
  onClose,
  onSave,
  poiName = '',
}: SaveDetourModalProps) {
  const [detourName, setDetourName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible && poiName) {
      // Auto-suggest name based on POI
      setDetourName(`Detour via ${poiName}`);
    }
  }, [visible, poiName]);

  const handleSave = async () => {
    if (!detourName.trim()) {
      setError('Please enter a name for your detour');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(detourName.trim());
      // Reset state
      setDetourName('');
      setError('');
      onClose();
    } catch (err) {
      setError('Failed to save detour. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setDetourName('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.container}>
          <Text style={styles.title}>Save Detour</Text>
          <Text style={styles.subtitle}>
            Give your detour a memorable name
          </Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="e.g., Morning Coffee Run"
            placeholderTextColor={theme.colors.textSecondary}
            value={detourName}
            onChangeText={(text) => {
              setDetourName(text);
              if (error) setError('');
            }}
            autoFocus
            maxLength={50}
            editable={!isSaving}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={theme.colors.textPrimary} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    maxWidth: 400,
    ...theme.shadows.xl,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.cardBgSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  saveButtonText: {
    ...theme.typography.button,
    color: theme.colors.card,
  },
});
