import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGetAnimalsQuery } from '@/store/animalsApi';
import { EmptyState } from '@/components/ui/empty-state';
import { MediaCardSkeleton } from '@/components/ui/skeleton';

const { width } = Dimensions.get('window');

function animalImage(breed: string) {
  return breed.toLowerCase().includes('buffalo')
    ? require('@/assets/images/albino_buffalo.png')
    : require('@/assets/images/bangladeshi_cow.png');
}

function animalStatus(id: number): 'Healthy' | 'Under Treatment' {
  return id % 2 === 0 ? 'Under Treatment' : 'Healthy';
}

export default function AnimalsListScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: animals = [], isLoading } = useGetAnimalsQuery();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Animals</Text>
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search animals..."
          placeholderTextColor="#A39E99"
        />
      </View>

      {/* Filters Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity style={styles.filterIconButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterIconText}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'All' && styles.filterTabActive]}
          onPress={() => setActiveFilter('All')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'All' && styles.filterTabTextActive]}>All (12)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'Calf' && styles.filterTabActive]}
          onPress={() => setActiveFilter('Calf')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'Calf' && styles.filterTabTextActive]}>Calf (3)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'Bull' && styles.filterTabActive]}
          onPress={() => setActiveFilter('Bull')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'Bull' && styles.filterTabTextActive]}>Bull (2)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Animals Cards List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <>
            <MediaCardSkeleton imageSize={100} />
            <MediaCardSkeleton imageSize={100} />
            <MediaCardSkeleton imageSize={100} />
          </>
        ) : animals.length === 0 ? (
          <EmptyState
            title="No animals yet"
            description="Add your livestock to start tracking health, tasks, and records."
            actionLabel="Add Animal"
            onAction={() => router.push('/add-animal')}
          />
        ) : (
        animals.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: '/my-animal-detail',
              params: { id: item.id }
            })}
          >
            <Image source={item.image ? { uri: item.image } : animalImage(item.breed)} style={styles.cardImage} resizeMode="cover" />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    animalStatus(item.id) === 'Healthy' ? styles.statusHealthy : styles.statusTreatment,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      animalStatus(item.id) === 'Healthy' ? styles.statusTextHealthy : styles.statusTextTreatment,
                    ]}
                  >
                    {animalStatus(item.id)}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDesc} numberOfLines={1}>
                {item.color || 'cream'} colored coat and characteristics
              </Text>

              {/* Specs Grid */}
              <View style={styles.specsContainer}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Species</Text>
                  <Text style={styles.specValue}>{item.breed.split(' ')[0]}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Age</Text>
                  <Text style={styles.specValue}>{item.age}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Weight</Text>
                  <Text style={styles.specValue}>{item.weight}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )))}
      </ScrollView>

      {/* Floating Add Animal Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/add-animal')}
      >
        <Text style={styles.fabIcon}>＋</Text>
        <Text style={styles.fabText}>Add Animal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1817',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 14,
    height: 52,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#7C7672',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1A1817',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    height: 40,
    marginBottom: 20,
    gap: 8,
  },
  filterIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 36,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#7C7672',
  },
  filterIconText: {
    fontSize: 13,
    color: '#1A1817',
    fontWeight: '600',
  },
  filterTab: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 36,
  },
  filterTabActive: {
    backgroundColor: '#BD632F',
    borderColor: '#BD632F',
  },
  filterTabText: {
    fontSize: 13,
    color: '#1A1817',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Leave room for floating tab bar and FAB
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EAE1',
  },
  cardImage: {
    width: 100,
    height: 120,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusHealthy: {
    backgroundColor: '#E8F5E9',
  },
  statusTreatment: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextHealthy: {
    color: '#2E7D32',
  },
  statusTextTreatment: {
    color: '#E65100',
  },
  cardDesc: {
    fontSize: 12,
    color: '#7C7672',
    marginVertical: 4,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    borderRadius: 8,
    padding: 8,
  },
  specItem: {
    alignItems: 'flex-start',
  },
  specLabel: {
    fontSize: 9,
    color: '#9C9690',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1817',
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Positioned right above the main bottom navigation bar
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BD632F',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 24,
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 99,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginRight: 8,
    fontWeight: '700',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
