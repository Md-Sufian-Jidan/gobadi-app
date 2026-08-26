import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useForgotPasswordMutation } from '@/store/authApi';

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

type Tab = 'phone' | 'email';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSendOTP = async () => {
    setErrorMessage('');
    const identifier = tab === 'phone' ? phone : email;
    if (!identifier) {
      setErrorMessage(tab === 'phone' ? 'Phone number is required.' : 'Email is required.');
      return;
    }
    if (tab === 'phone' && !BD_PHONE_REGEX.test(phone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi phone number (e.g., 01*********).');
      return;
    }

    try {
      await forgotPassword({ identifier }).unwrap();
      router.push({
        pathname: '/otp',
        params: { phone: identifier, purpose: 'reset' },
      });
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Could not send OTP. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {tab === 'phone'
              ? 'Enter your phone number to get the password reset link.'
              : 'Enter your email address to get the password reset link.'}
          </Text>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setTab('phone')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, tab === 'phone' && styles.tabTextActive]}>
                Phone Number
              </Text>
              {tab === 'phone' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setTab('email')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, tab === 'email' && styles.tabTextActive]}>
                Email
              </Text>
              {tab === 'email' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === 'phone' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number*</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeSelector}>
                    <Text style={styles.flagEmoji}>🇧🇩</Text>
                    <Text style={styles.countryCode}>+880</Text>
                  </View>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone number"
                    placeholderTextColor="#A39E99"
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.emailInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="hello@example.com"
                  placeholderTextColor="#A39E99"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Error message */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -2,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#BD632F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C7672',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    gap: 24,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C9690',
    paddingBottom: 8,
  },
  tabTextActive: {
    color: '#BD632F',
  },
  tabUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: '#BD632F',
    borderRadius: 1,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1817',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    height: 52,
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    color: '#1A1817',
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E6E1DC',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1817',
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1817',
  },
  sendButton: {
    backgroundColor: '#BD632F',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#E53935',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
});
