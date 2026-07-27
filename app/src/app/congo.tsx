import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CongoScreen() {
  const router = useRouter();

  const handleSignIn = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Decorative Grid Illustration */}
        <View style={styles.placeholderBox}>
          <View style={styles.placeholderGrid} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Congratulations!</Text>

        {/* Subtitle / Copy */}
        <View style={styles.textContainer}>
          <Text style={styles.bodyText}>
            We have sent you a verification email, please check your inbox and follow the instructions to verify your account.
          </Text>
          <Text style={styles.thankYouText}>
            Thank you for signing up with us!
          </Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} activeOpacity={0.8} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  placeholderBox: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    backgroundColor: '#F3EFE9',
    overflow: 'hidden',
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  placeholderGrid: {
    width: '90%',
    height: '90%',
    borderColor: '#E6E1DC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#BD632F',
    marginBottom: 20,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 40,
  },
  bodyText: {
    fontSize: 16,
    color: '#7C7672',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  thankYouText: {
    fontSize: 16,
    color: '#7C7672',
    textAlign: 'center',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#BD632F',
    width: '100%',
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
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
