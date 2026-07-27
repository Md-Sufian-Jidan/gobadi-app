import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Booked' | 'Placed'>('Booked');
  const [activeCategory, setActiveCategory] = useState('Animals');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: '1', name: 'Animals', icon: '🐂' },
    { id: '2', name: 'Proteins', icon: '🥩' },
    { id: '3', name: 'Dairy', icon: '🧀' },
    { id: '4', name: 'Food', icon: '🌾' },
    { id: '5', name: 'Equipments', icon: '🪓' },
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

        <Text style={styles.headerTitle}>My Cart</Text>

        <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
          <Text style={styles.buttonText}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Delivery Details Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <TouchableOpacity style={styles.changeAddressBtn} activeOpacity={0.7}>
            <Text style={styles.changeAddressText}>Change Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressPin}>📍</Text>
            <Text style={styles.addressType}>Home</Text>
          </View>
          <Text style={styles.addressText}>
            Road# 9, house# 5, Lane#3, Mirpur 11/a, Dhaka-1216.
          </Text>
        </View>

        {/* Search Order input */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Search Order"
            placeholderTextColor="#A39E99"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Booked Order vs Placed Order tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Booked' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Booked')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Booked' && styles.tabTextActive]}>
              Booked Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Placed' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Placed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Placed' && styles.tabTextActive]}>
              Placed Order
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Icons Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => setActiveCategory(cat.name)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryCircle, isActive && styles.categoryCircleActive]}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filter chips row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {['All (12)', 'Calf(3)', 'Bull (2)', 'Cow(4)'].map((filterVal) => {
            const isSelected = activeFilter === filterVal || (filterVal.startsWith('All') && activeFilter === 'All');
            return (
              <TouchableOpacity
                key={filterVal}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(filterVal.startsWith('All') ? 'All' : filterVal)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {filterVal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Card List container */}
        <View style={styles.listContainer}>
          {activeTab === 'Booked' ? (
            /* Booked Order Card */
            <View style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <Image source={require('@/assets/images/kota_goat.png')} style={styles.cardImage} />
                <View style={styles.cardDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>Kota Goat</Text>
                    <View style={styles.bookedBadge}>
                      <Text style={styles.bookedBadgeText}>🏷️ Booked</Text>
                    </View>
                    <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
                      <Text style={styles.shareIcon}>📤</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardPrice}>৳ 16,000</Text>

                  <View style={styles.specsRow}>
                    <View style={styles.specCell}>
                      <Text style={styles.specLabel}>Species</Text>
                      <Text style={styles.specValue}>Bangladeshi</Text>
                    </View>
                    <View style={styles.specCell}>
                      <Text style={styles.specLabel}>Age</Text>
                      <Text style={styles.specValue}>13 months</Text>
                    </View>
                    <View style={styles.specCell}>
                      <Text style={styles.specLabel}>Weight</Text>
                      <Text style={styles.specValue}>32 Kg</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Booking Info row */}
              <View style={styles.bookingInfoRow}>
                <View style={styles.sellerCol}>
                  <View style={styles.sellerRow}>
                    <View style={styles.sellerAvatar}>
                      <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <View>
                      <Text style={styles.sellerName}>Abdur Rahman</Text>
                      <Text style={styles.sellerLoc}>📍 Gabtoli, Dhaka</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.datesCol}>
                  <Text style={styles.dateLabel}>Booked on</Text>
                  <Text style={styles.dateValue}>13th May</Text>
                </View>
                
                <View style={styles.amountCol}>
                  <Text style={styles.amountLabel}>Paid Amount</Text>
                  <Text style={styles.amountValue}>৳ 5000</Text>
                </View>
              </View>

              {/* Warning/Remaining time text */}
              <Text style={styles.timeWarningText}>
                You booked for 10 days. Booking remains:{' '}
                <Text style={styles.timeRemainingHighlight}>8d : 20h : 30m</Text>
              </Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/checkout')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnIcon}>✓</Text>
                <Text style={styles.actionBtnText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Placed Order Card */
            <View style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <Image source={require('@/assets/images/kota_goat.png')} style={styles.cardImage} />
                <View style={styles.cardDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>Kota Goat</Text>
                    <View style={styles.orderedBadge}>
                      <Text style={styles.orderedBadgeText}>✓ Ordered</Text>
                    </View>
                    <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
                      <Text style={styles.shareIcon}>📤</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardPrice}>৳ 16,000</Text>

                  <View style={styles.specsRow}>
                    <View style={styles.specCell}>
                      <Text style={styles.specLabel}>Species</Text>
                      <Text style={styles.specValue}>Bangladeshi</Text>
                    </View>
                    <View style={styles.specCell}>
                      <Text style={styles.specLabel}>Age</Text>
                      <Text style={styles.specValue}>13 months</Text>
                    </View>
                    <View style={styles.specCell}>
                      <Text style={styles.specLabel}>Weight</Text>
                      <Text style={styles.specValue}>32 Kg</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Booking Info row */}
              <View style={styles.bookingInfoRow}>
                <View style={styles.sellerCol}>
                  <View style={styles.sellerRow}>
                    <View style={styles.sellerAvatar}>
                      <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <View>
                      <Text style={styles.sellerName}>Abdur Rahman</Text>
                      <Text style={styles.sellerLoc}>📍 Gabtoli, Dhaka</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.datesCol, { flex: 1.5, alignItems: 'flex-end' }]}>
                  <Text style={styles.dateLabel}>Ordered on</Text>
                  <Text style={styles.dateValue}>13th May</Text>
                </View>
              </View>

              {/* Delivery ETA text */}
              <Text style={styles.timeWarningText}>
                Your delivery is on the way. Estimated Time:{' '}
                <Text style={styles.timeRemainingHighlight}>4h : 30m</Text>
              </Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/animal-billing-details')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnIcon}>📄</Text>
                <Text style={styles.actionBtnText}>Detail Bill</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 16,
    marginBottom: 20,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  changeAddressBtn: {
    backgroundColor: '#BD632F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeAddressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressPin: {
    fontSize: 14,
    marginRight: 6,
  },
  addressType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  addressText: {
    fontSize: 12,
    color: '#7C7672',
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#9C9690',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1A1817',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E6E1DC',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#BD632F',
    marginBottom: -2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9C9690',
  },
  tabTextActive: {
    color: '#BD632F',
    fontWeight: '700',
  },
  categoriesRow: {
    gap: 16,
    paddingBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryCircleActive: {
    borderColor: '#BD632F',
    borderWidth: 1.5,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C9690',
  },
  categoryLabelActive: {
    color: '#BD632F',
    fontWeight: '700',
  },
  filtersRow: {
    gap: 8,
    paddingBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
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
  listContainer: {
    gap: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 14,
  },
  cardDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    flex: 1,
  },
  bookedBadge: {
    backgroundColor: '#FFF8F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  bookedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BD632F',
  },
  orderedBadge: {
    backgroundColor: '#EEFBEF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  orderedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  shareBtn: {
    padding: 2,
  },
  shareIcon: {
    fontSize: 13,
    color: '#BD632F',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BD632F',
    marginBottom: 8,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  specCell: {
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    color: '#9C9690',
    fontWeight: '500',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1817',
  },
  bookingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#FAF9F6',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FAF9F6',
    paddingVertical: 12,
    marginBottom: 12,
  },
  sellerCol: {
    flex: 1.5,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9E5DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  sellerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  sellerLoc: {
    fontSize: 10,
    color: '#9C9690',
    marginTop: 1,
  },
  datesCol: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#9C9690',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  amountCol: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    color: '#9C9690',
    fontWeight: '500',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  timeWarningText: {
    fontSize: 11,
    color: '#7C7672',
    textAlign: 'center',
    marginBottom: 16,
  },
  timeRemainingHighlight: {
    color: '#E53935',
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#BD632F',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
