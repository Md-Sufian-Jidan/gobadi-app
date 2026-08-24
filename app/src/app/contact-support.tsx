import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ContactSupportScreen() {
  const router = useRouter();

  function handleEmail() {
    Linking.openURL('mailto:support@gobaadi.com').catch(() =>
      Alert.alert('Email Error', 'Could not open email client.')
    );
  }

  function handleCall() {
    Linking.openURL('tel:+8801911418977').catch(() =>
      Alert.alert('Call Error', 'Could not initiate phone call.')
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Contact Support</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsList}>
          {/* Email Card */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={22} color="#BD632F" />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>support@gobaadi.com</Text>
            </View>
          </TouchableOpacity>

          {/* Phone Card */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={22} color="#BD632F" />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardLabel}>Customer Service</Text>
              <Text style={styles.cardValue}>+8801911418977</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1817',
  },
  cardsList: {
    gap: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextCol: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#7C7672',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
});
