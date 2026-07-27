import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '@/store/usersApi';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation();

  const [name, setName] = useState('');

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  async function handleSave() {
    try {
      await updateProfile({ name }).unwrap();
      router.back();
    } catch (err) {
      console.log('Error updating profile:', err);
      Alert.alert('Could not save', 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card Container */}
        <View style={styles.profileCard}>
          {/* Avatar with Camera Icon Overlay */}
          <View style={styles.avatarWrapper}>
            <Image
              source={require('@/assets/images/user_profile.png')}
              style={styles.avatarImage}
            />
            <TouchableOpacity style={styles.cameraIconContainer} activeOpacity={0.85}>
              <Text style={styles.cameraEmoji}>📷</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Your name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                placeholderTextColor="#A39E99"
              />
              <TouchableOpacity style={styles.inputActionBtn} activeOpacity={0.7}>
                <Text style={styles.actionIcon}>🎤</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={profile?.phone || ''}
                editable={false}
                placeholderTextColor="#A39E99"
                keyboardType="phone-pad"
              />
              <View style={styles.verifiedIconContainer}>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>Save Changes</Text>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 28,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1817',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#E6E1DC',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraEmoji: {
    fontSize: 18,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9C9690',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1A1817',
    fontWeight: '700',
  },
  inputActionBtn: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 18,
    color: '#BD632F',
  },
  verifiedIconContainer: {
    backgroundColor: '#E8F5E9',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedCheck: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '800',
  },
  saveButton: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
