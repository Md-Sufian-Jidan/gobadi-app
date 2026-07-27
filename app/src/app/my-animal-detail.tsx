import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetAnimalByIdQuery, useDeleteAnimalMutation } from '@/store/animalsApi';

const { width } = Dimensions.get('window');

export default function MyAnimalDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = String(params.id || '');

  const { data: animal } = useGetAnimalByIdQuery(id, { skip: !id });
  const [deleteAnimal] = useDeleteAnimalMutation();

  function confirmDelete() {
    Alert.alert('Delete Animal', `Remove ${animal?.name || 'this animal'} from your farm?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAnimal(id).unwrap();
            router.back();
          } catch (err) {
            console.log('Error deleting animal:', err);
          }
        },
      },
    ]);
  }

  const image = animal?.image
    ? { uri: animal.image }
    : animal?.breed?.toLowerCase().includes('buffalo')
      ? require('@/assets/images/albino_buffalo.png')
      : require('@/assets/images/bangladeshi_cow.png');

  const basicInfo = animal
    ? [
        { label: 'Breed', value: animal.breed },
        { label: 'Age', value: animal.age },
        { label: 'Color', value: animal.color },
        { label: 'Live Weight', value: animal.weight },
      ]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Image Area */}
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.mainImage} resizeMode="cover" />

          <View style={styles.imageHeader}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={confirmDelete} activeOpacity={0.8}>
              <Text style={styles.buttonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.animalTitle}>{animal?.name || 'Loading...'}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.gridContainer}>
            {basicInfo.map((info, idx) => (
              <View key={idx} style={styles.gridCard}>
                <Text style={styles.gridLabel}>{info.label}</Text>
                <Text style={styles.gridValue}>{info.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom action button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push({ pathname: '/add-animal', params: { id, edit: '1' } })}
          activeOpacity={0.85}
        >
          <Text style={styles.editBtnText}>✏️ Edit Animal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageHeader: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    padding: 24,
  },
  titleRow: {
    marginBottom: 20,
  },
  animalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1817',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F0EAE1',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BD632F',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 14,
    padding: 14,
  },
  gridLabel: {
    fontSize: 10,
    color: '#9C9690',
    fontWeight: '500',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9E5DF',
  },
  editBtn: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
