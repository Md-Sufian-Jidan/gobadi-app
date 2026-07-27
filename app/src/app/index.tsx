import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Half: Logo / Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.decorativeCircle} />
        </View>

        {/* Bottom Half: Texts and Button */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Everything Your Farm{"\n"}Needs in One App</Text>
          <Text style={styles.subtitle}>
            Keep your herd healthy and organised with simple foods that save time and help you stay in control.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Sleek cream background
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    zIndex: 2,
  },
  decorativeCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: '#F3EFE9',
    opacity: 0.6,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1817',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7C7672',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#BD632F', // Terracotta brown
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
