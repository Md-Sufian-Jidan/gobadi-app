import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordFieldProps extends Omit<TextInputProps, 'secureTextEntry' | 'style'> {
  value: string;
  onChangeText: (text: string) => void;
}

export function PasswordField({ value, onChangeText, placeholder, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '•••••••••••••••••'}
        placeholderTextColor="#A39E99"
        secureTextEntry={!visible}
        textContentType="password"
        {...rest}
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setVisible((v) => !v)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#7C7672" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    height: 52,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1817',
  },
  eyeButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
