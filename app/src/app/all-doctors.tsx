import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGetDoctorsQuery } from '@/store/doctorsApi';
import { EmptyState } from '@/components/ui/empty-state';
import { MediaCardSkeleton } from '@/components/ui/skeleton';

interface DoctorView {
  id: number;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: number;
  image: any;
}

export default function AllDoctorsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: doctorList = [], isLoading } = useGetDoctorsQuery();

  const doctors: DoctorView[] = useMemo(
    () =>
      doctorList.map((d) => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        location: 'Uttar Badda, Dhaka',
        rating: d.rating || 4.8,
        reviews: 124,
        image: d.avatar === 'jessica_doctor.png'
          ? require('@/assets/images/jessica_doctor.png')
          : require('@/assets/images/michael_doctor.png'),
      })),
    [doctorList],
  );

  const filterOptions = [
    { label: '⚙️ Filter', value: 'filter' },
    { label: 'All (12)', value: 'All' },
    { label: 'Medicine(3)', value: 'Medicine' },
    { label: 'Gynaecology(2)', value: 'Gynaecology' },
  ];

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

        <Text style={styles.headerTitle}>All Doctors</Text>

        <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
          <Text style={styles.buttonText}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Location bar */}
      <View style={styles.locationContainer}>
        <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={styles.locationText}>Uttar Badda, Dhaka</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctor"
          placeholderTextColor="#A39E99"
        />
      </View>

      {/* Filter Chips Row */}
      <View style={styles.filterOuterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {filterOptions.map((opt) => {
            const isActive = opt.value === activeFilter;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                  opt.value === 'filter' && styles.filterSettingsChip
                ]}
                onPress={() => {
                  if (opt.value !== 'filter') {
                    setActiveFilter(opt.value);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Doctor Cards Scroll List */}
      <ScrollView contentContainerStyle={styles.cardsScroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <>
            <MediaCardSkeleton imageSize={80} />
            <MediaCardSkeleton imageSize={80} />
            <MediaCardSkeleton imageSize={80} />
          </>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No doctors available"
            description="Check back soon — new vets are added regularly."
          />
        ) : (
        doctors.map((doc) => (
          <View key={doc.id} style={styles.doctorCard}>
            <View style={styles.doctorCardMain}>
              <Image source={doc.image} style={styles.doctorPortrait} />
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{doc.name}</Text>
                <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                <View style={styles.ratingLocationRow}>
                  <Text style={styles.locationPin}>📍</Text>
                  <Text style={styles.locationTextMeta}>{doc.location}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.ratingValue}>{doc.rating}</Text>
                  <Text style={styles.reviewsText}>| {doc.reviews} Reviews</Text>
                </View>
              </View>
            </View>

            <View style={styles.doctorCardButtons}>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => router.push({ pathname: '/book-slot', params: { id: doc.id } })}
                activeOpacity={0.8}
              >
                <Text style={styles.bookButtonText}>📅 Book Slot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => router.push({ pathname: '/doctor-detail', params: { id: doc.id } })}
                activeOpacity={0.8}
              >
                <Text style={styles.detailsButtonText}>📄 Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 12,
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
  locationContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#BD632F',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#7C7672',
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
  filterOuterContainer: {
    marginBottom: 20,
  },
  filterChipsRow: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSettingsChip: {
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#BD632F',
    borderColor: '#BD632F',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C7672',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  cardsScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0EAE1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorCardMain: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorPortrait: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  doctorDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#7C7672',
    marginBottom: 6,
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationPin: {
    fontSize: 11,
    color: '#9C9690',
    marginRight: 4,
  },
  locationTextMeta: {
    fontSize: 11,
    color: '#9C9690',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1817',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: '#9C9690',
  },
  doctorCardButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bookButton: {
    flex: 1.2,
    backgroundColor: '#BD632F',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BD632F',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#BD632F',
    fontSize: 12,
    fontWeight: '700',
  },
});
