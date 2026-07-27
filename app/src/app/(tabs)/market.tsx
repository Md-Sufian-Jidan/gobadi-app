import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetCatalogQuery, useGetMyListingsQuery } from '@/store/marketplaceApi';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MarketItemView {
  id: number;
  title: string;
  price: string;
  timeAgo: string;
  species: string;
  age: string;
  liveWeight: string;
  sellerName: string;
  location: string;
  image: any;
}

export default function MarketScreen() {
  const router = useRouter();
  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy');
  const [activeCategory, setActiveCategory] = useState('Animals');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const categories: Category[] = [
    { id: '1', name: 'Animals', icon: '🐂' },
    { id: '2', name: 'Proteins', icon: '🥩' },
    { id: '3', name: 'Dairy', icon: '🧀' },
    { id: '4', name: 'Food', icon: '🌾' },
    { id: '5', name: 'Equipments', icon: '🪓' },
    { id: '6', name: 'Vaccines', icon: '💉' },
  ];

  const { data: catalog = [] } = useGetCatalogQuery();
  const { data: myListings = [] } = useGetMyListingsQuery(undefined, { skip: tradeType !== 'Sell' });

  const marketItems: MarketItemView[] = useMemo(
    () =>
      catalog.map((item) => ({
        id: item.id,
        title: item.name,
        price: item.price.toLocaleString(),
        timeAgo: 'Just now',
        species: item.category === 'Animals' ? 'Albenian' : 'Feed Pack',
        age: item.category === 'Animals' ? '28 months' : 'N/A',
        liveWeight: item.category === 'Animals' ? '725 Kg' : '50 Kg',
        sellerName: 'Abdur Rahman',
        location: 'Gabtoli, Dhaka',
        image: item.image
          ? { uri: item.image }
          : item.name.toLowerCase().includes('goat')
            ? require('@/assets/images/kota_goat.png')
            : require('@/assets/images/albino_buffalo.png'),
      })),
    [catalog],
  );

  const filteredItems = marketItems.filter((item) => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Calf/Bull Filters simulation
    if (activeFilter === 'Calf(3)' && item.title !== 'Kota Goat') return false;
    if (activeFilter === 'Bull(2)' && item.title !== 'Albenian Buffalo') return false;

    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Marketplace</Text>
          {/* Location row */}
          <View style={styles.locationRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText}>Uttar Badda, Dhaka</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
        </View>

        {/* My Cart Button */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/checkout')}
          activeOpacity={0.8}
        >
          <Text style={styles.cartText}>🛒 My Cart</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Buy / Sell Toggle Selector */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, tradeType === 'Buy' && styles.toggleBtnActive]}
            onPress={() => setTradeType('Buy')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, tradeType === 'Buy' && styles.toggleBtnTextActive]}>
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, tradeType === 'Sell' && styles.toggleBtnActive]}
            onPress={() => setTradeType('Sell')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, tradeType === 'Sell' && styles.toggleBtnTextActive]}>
              Sell
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search input field */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Search anything...."
            placeholderTextColor="#A39E99"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Horizontal Selector Row */}
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

        {tradeType === 'Sell' ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Listings</Text>
            </View>

            <View style={styles.itemsList}>
              {myListings.length === 0 ? (
                <Text style={styles.emptyListingsText}>You haven't listed anything for sale yet.</Text>
              ) : (
                myListings.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.cardMain}>
                      <Image
                        source={item.image ? { uri: item.image } : require('@/assets/images/albino_buffalo.png')}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemMeta}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemPrice}>৳ {item.price.toLocaleString()}</Text>
                        <Text style={styles.specValue}>{item.category}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={styles.addListingBtn}
              onPress={() => router.push('/add-listing')}
              activeOpacity={0.85}
            >
              <Text style={styles.addListingBtnText}>＋ Add Listing</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Trending Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Most Trending Animals</Text>
            </View>

            {/* Filters Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
            >
              <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
                <Text style={styles.filterBtnIcon}>⚙️</Text>
                <Text style={styles.filterBtnText}>Filter</Text>
              </TouchableOpacity>
              {['All (12)', 'Calf(3)', 'Bull (2)'].map((filterVal) => {
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

            {/* Item Cards List */}
            <View style={styles.itemsList}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => router.push({ pathname: '/animal-details', params: { id: item.id } })}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardMain}>
                    <Image source={item.image} style={styles.itemImage} />

                    <View style={styles.itemMeta}>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.timeBadge}>{item.timeAgo}</Text>
                        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
                          <Text style={styles.shareIcon}>📤</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemPrice}>৳ {item.price}</Text>

                      {/* Animal Specifications */}
                      <View style={styles.specsRow}>
                        <View style={styles.specCell}>
                          <Text style={styles.specLabel}>Species</Text>
                          <Text style={styles.specValue}>{item.species}</Text>
                        </View>
                        <View style={styles.specCell}>
                          <Text style={styles.specLabel}>Age</Text>
                          <Text style={styles.specValue}>{item.age}</Text>
                        </View>
                        <View style={styles.specCell}>
                          <Text style={styles.specLabel}>Live Weight</Text>
                          <Text style={styles.specValue}>{item.liveWeight}</Text>
                        </View>
                      </View>

                      {/* Seller info row */}
                      <View style={styles.sellerRow}>
                        <View style={styles.sellerLeft}>
                          <View style={styles.sellerAvatarCircle}>
                            <Text style={styles.sellerAvatarEmoji}>👤</Text>
                          </View>
                          <View>
                            <Text style={styles.sellerName}>{item.sellerName}</Text>
                            <Text style={styles.sellerLoc}>📍 {item.location}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.messageBtn}
                          onPress={() => router.push('/chat')}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.messageBtnText}>💬 Message</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons footer */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.bookBtn}
                      onPress={() => router.push({ pathname: '/checkout', params: { id: item.id } })}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.bookBtnText}>🏷️ Book Animal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buyBtn}
                      onPress={() => router.push({ pathname: '/checkout', params: { id: item.id } })}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.buyBtnText}>🛒 Buy Animal</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1817',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationPin: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 8,
    color: '#BD632F',
  },
  cartButton: {
    backgroundColor: '#BD632F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#BD632F',
  },
  toggleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7C7672',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
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
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
  },
  filtersRow: {
    gap: 8,
    paddingBottom: 20,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterBtnIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C7672',
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
  itemsList: {
    gap: 20,
  },
  emptyListingsText: {
    fontSize: 13,
    color: '#9C9690',
    textAlign: 'center',
    paddingVertical: 30,
  },
  addListingBtn: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addListingBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
  },
  cardMain: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 14,
  },
  itemMeta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    flex: 1,
  },
  timeBadge: {
    fontSize: 10,
    color: '#BD632F',
    backgroundColor: '#FFF8F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 6,
  },
  shareBtn: {
    padding: 2,
  },
  shareIcon: {
    fontSize: 13,
    color: '#BD632F',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BD632F',
    marginBottom: 8,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: '#FAF9F6',
    paddingTop: 12,
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9E5DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sellerAvatarEmoji: {
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
  messageBtn: {
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  messageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BD632F',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bookBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#BD632F',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#BD632F',
    fontSize: 14,
    fontWeight: '700',
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#BD632F',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
