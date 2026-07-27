import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Share,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetAnimalsQuery } from '@/store/animalsApi';
import { useGetTasksQuery, useToggleTaskMutation } from '@/store/tasksApi';
import { useGetWeatherQuery } from '@/store/weatherApi';
import { useGetAlertsQuery, useActOnAlertMutation } from '@/store/alertsApi';
import { useGetMyReferralQuery, useClaimReferralMutation } from '@/store/referralsApi';

const { width } = Dimensions.get('window');

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFullDate(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatTaskTime(scheduledTime: string): string {
  return new Date(scheduledTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function HomeDashboard() {
  const router = useRouter();

  const { data: allAnimals } = useGetAnimalsQuery();
  const { data: tasks = [] } = useGetTasksQuery(todayDateKey());
  const { data: weather } = useGetWeatherQuery();
  const { data: alerts = [] } = useGetAlertsQuery();
  const { data: referral } = useGetMyReferralQuery();
  const [claimReferral, { isLoading: isClaiming }] = useClaimReferralMutation();

  const [toggleTaskMutation] = useToggleTaskMutation();
  const [actOnAlertMutation] = useActOnAlertMutation();

  const [showClaimInput, setShowClaimInput] = useState(false);
  const [claimCode, setClaimCode] = useState('');

  const animals = (allAnimals || []).slice(0, 3);

  async function shareReferral() {
    if (!referral) return;
    try {
      await Share.share({
        message: `Join me on Gobadi! Use my referral code ${referral.referralCode} to sign up: ${referral.shareLink}`,
      });
    } catch (err) {
      console.log('Error sharing referral:', err);
    }
  }

  async function handleClaimReferral() {
    const code = claimCode.trim();
    if (!code) return;
    try {
      await claimReferral(code).unwrap();
      setClaimCode('');
      setShowClaimInput(false);
      Alert.alert('Success', 'Referral code claimed!');
    } catch (err) {
      console.log('Error claiming referral:', err);
      Alert.alert('Could not claim', 'That code may be invalid or already used.');
    }
  }

  function toggleTask(id: number) {
    toggleTaskMutation(String(id));
  }

  function actOnAlert(alertId: number, actionChoice: 'MANAGE' | 'SCHEDULE') {
    actOnAlertMutation({ id: alertId, actionChoice });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingText}>Hello, <Text style={styles.greetingBold}>Good Morning</Text></Text>
            <TouchableOpacity style={styles.dateSelector} activeOpacity={0.7}>
              <Text style={styles.dateText}>{formatFullDate()}</Text>
              <Text style={styles.dropdownArrow}>∨</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.8}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.bellIcon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Farm Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherCardHeader}>
            <Text style={styles.weatherLocation}>📍 Farm Weather{weather ? ` - ${weather.location}` : ''}</Text>
            <Image
              source={require('@/assets/images/farm_barn.png')}
              style={styles.barnImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.tempContainer}>
            <Text style={styles.tempText}>
              {weather ? Math.round(weather.temperature) : '--'} <Text style={styles.tempUnit}>°C</Text>
            </Text>
            <View style={styles.hiLowContainer}>
              <Text style={styles.hiLowText}>H: <Text style={styles.hiText}>{weather ? Math.round(weather.highTemp) : '--'}°C</Text></Text>
              <Text style={styles.hiLowText}>L: <Text style={styles.lowText}>{weather ? Math.round(weather.lowTemp) : '--'}°C</Text></Text>
            </View>
          </View>

          <View style={styles.weatherDivider} />

          {/* Weather Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricValue}>{weather ? `${weather.humidityPercentage}%` : '--'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Precipitation</Text>
              <Text style={styles.metricValue}>{weather ? `${weather.precipitationMl} ml` : '--'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pressure</Text>
              <Text style={styles.metricValue}>{weather ? `${weather.pressureHpa} hpa` : '--'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricValue}>{weather ? `${weather.windMps} m/s` : '--'}</Text>
            </View>
          </View>

          {/* Sunrise / Sunset Arc */}
          <View style={styles.arcContainer}>
            <View style={styles.arcLine} />
            <Text style={styles.sunIcon}>☀️</Text>
            <View style={styles.arcLabels}>
              <View>
                <Text style={styles.arcTime}>{weather ? formatClockTime(weather.sunriseTime) : '--'}</Text>
                <Text style={styles.arcType}>Sunrise</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.arcTime}>{weather ? formatClockTime(weather.sunsetTime) : '--'}</Text>
                <Text style={[styles.arcType, { color: '#4A6FA5' }]}>Sunset</Text>
              </View>
            </View>
          </View>
        </View>

        {/* My Animals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Animals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/animals')}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {animals.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.listItem, idx === animals.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/my-animal-detail',
                params: { id: item.id }
              })}
            >
              <View style={styles.listItemLeft}>
                <View style={styles.checkeredIcon}>
                  <View style={styles.checkeredGrid} />
                </View>
                <View>
                  <Text style={styles.animalName}>{item.name}</Text>
                  <Text style={styles.animalBreed}>{item.breed}</Text>
                </View>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Task Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Today's Task</Text>

        <View style={styles.listCard}>
          {tasks.map((task, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => toggleTask(task.id)}
              style={[styles.taskItem, idx === tasks.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.taskItemLeft}>
                <View style={styles.checkeredIcon}>
                  <View style={styles.checkeredGrid} />
                </View>
                <View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.detail ? <Text style={styles.taskDetail}>{task.detail}</Text> : null}
                </View>
              </View>

              <View style={styles.taskItemRight}>
                <Text style={styles.taskTime}>{formatTaskTime(task.scheduledTime)}</Text>
                <View style={[styles.checkbox, task.isDone ? styles.checkboxChecked : styles.checkboxUnchecked]}>
                  {task.isDone ? <Text style={styles.checkIcon}>✓</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alertsScroll}
        >
          {alerts.length === 0 ? (
            <Text style={styles.noAlertsText}>No active alerts right now.</Text>
          ) : (
            alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View
                  style={[
                    styles.alertIconCircle,
                    alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                      ? styles.alertIconRed
                      : styles.alertIconOrange,
                  ]}
                >
                  <Text style={styles.alertIconText}>{alert.actionType === 'MANAGE' ? '⚠' : '⚙'}</Text>
                </View>
                <Text style={styles.alertCardTitle}>{alert.title}</Text>
                <Text style={styles.alertCardSub}>{alert.location} • {alert.crop}</Text>
                <TouchableOpacity
                  style={styles.alertCardBtn}
                  activeOpacity={0.8}
                  onPress={() => actOnAlert(alert.id, alert.actionType)}
                >
                  <Text style={styles.alertCardBtnText}>
                    {alert.actionType === 'MANAGE' ? 'Manage Now' : 'Schedule'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Refer to Friend & Earn Banner */}
        <View style={styles.referBanner}>
          <View style={styles.referLeft}>
            <Text style={styles.referTitle}>Refer to Your Friend and Earn</Text>
            <Text style={styles.referSub}>
              {referral && referral.totalEarned > 0
                ? `You've earned Tk ${referral.totalEarned} from ${referral.referralCount} referrals`
                : 'Earn Tk 100 For Every Referral'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.referBtn} activeOpacity={0.8} onPress={shareReferral}>
                <Text style={styles.referBtnText}>Refer Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.referBtn}
                activeOpacity={0.8}
                onPress={() => setShowClaimInput((v) => !v)}
              >
                <Text style={styles.referBtnText}>Have a code?</Text>
              </TouchableOpacity>
            </View>
            {showClaimInput ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <TextInput
                  style={styles.claimInput}
                  placeholder="Enter code"
                  placeholderTextColor="#A39E99"
                  value={claimCode}
                  onChangeText={setClaimCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[styles.referBtn, isClaiming && { opacity: 0.6 }]}
                  activeOpacity={0.8}
                  onPress={handleClaimReferral}
                  disabled={isClaiming}
                >
                  <Text style={styles.referBtnText}>Claim</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <Image
            source={require('@/assets/images/referral_badge.png')}
            style={styles.referImage}
            resizeMode="contain"
          />
        </View>

        {/* Marketplace Section */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 24, marginTop: 24, marginBottom: 16 }]}>Marketplace</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.marketCategoriesRow}
        >
          {[
            { label: 'Feeds', icon: '🌾' },
            { label: 'Milk', icon: '🥛' },
            { label: 'Meat', icon: '🥩' },
            { label: 'Animals', icon: '🐂' }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.marketCategoryCard}
              onPress={() => router.push('/market')}
              activeOpacity={0.8}
            >
              <View style={styles.marketCategoryIconContainer}>
                <Text style={styles.marketCategoryIconText}>{item.icon}</Text>
              </View>
              <Text style={styles.marketCategoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Today's Market Rates */}
        <View style={styles.marketRatesCard}>
          <View style={styles.ratesHeader}>
            <Text style={styles.ratesTitle}>Today's Market Rates</Text>
            <View style={styles.ratesDropdown}>
              <Text style={styles.ratesDropdownText}>Feeds ∨</Text>
            </View>
          </View>

          <View style={styles.ratesList}>
            {[1, 2, 3].map((_, idx) => (
              <View key={idx} style={styles.ratesItem}>
                <View style={styles.ratesItemLeft}>
                  <View style={styles.ratesItemDot} />
                  <View>
                    <Text style={styles.ratesItemTitle}>CATTLE BHUSHI MIX FEED</Text>
                    <Text style={styles.ratesItemPrice}>Tk 1,350</Text>
                  </View>
                </View>
                <Text style={styles.ratesChevron}>➔</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewMarketBtn}
            onPress={() => router.push('/market')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewMarketBtnText}>View Market</Text>
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
    paddingBottom: 110,
  },
  header: {
    backgroundColor: '#BD632F',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  greetingBold: {
    fontWeight: '700',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    color: '#F4ECE6',
    fontSize: 14,
    marginRight: 6,
  },
  dropdownArrow: {
    color: '#F4ECE6',
    fontSize: 10,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 18,
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 24,
    marginTop: -50,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  weatherCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  weatherLocation: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BD632F',
  },
  barnImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginTop: -10,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -20,
    marginBottom: 16,
  },
  tempText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1817',
  },
  tempUnit: {
    fontSize: 24,
    fontWeight: '400',
  },
  hiLowContainer: {
    marginLeft: 16,
    marginBottom: 8,
  },
  hiLowText: {
    fontSize: 12,
    color: '#7C7672',
    fontWeight: '500',
    lineHeight: 18,
  },
  hiText: {
    color: '#BD632F',
    fontWeight: '700',
  },
  lowText: {
    color: '#4A6FA5',
    fontWeight: '700',
  },
  weatherDivider: {
    height: 1,
    backgroundColor: '#F0EAE1',
    marginVertical: 12,
    borderStyle: 'dashed',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#9C9690',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  arcContainer: {
    marginTop: 10,
    alignItems: 'center',
    position: 'relative',
    height: 60,
    width: '100%',
  },
  arcLine: {
    position: 'absolute',
    top: 15,
    width: '80%',
    height: 40,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
  },
  sunIcon: {
    position: 'absolute',
    right: '25%',
    top: 2,
    fontSize: 18,
  },
  arcLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  arcTime: {
    fontSize: 11,
    color: '#1A1817',
    fontWeight: '600',
  },
  arcType: {
    fontSize: 11,
    color: '#BD632F',
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  viewAllText: {
    fontSize: 14,
    color: '#BD632F',
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 24,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkeredIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3EFE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  checkeredGrid: {
    width: '80%',
    height: '80%',
    borderColor: '#E6E1DC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 18,
  },
  animalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  animalBreed: {
    fontSize: 13,
    color: '#7C7672',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#BD632F',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE1',
  },
  taskItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  taskDetail: {
    fontSize: 13,
    color: '#7C7672',
    marginTop: 2,
  },
  taskItemRight: {
    alignItems: 'flex-end',
  },
  taskTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkboxUnchecked: {
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    backgroundColor: '#FFFFFF',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  alertsScroll: {
    paddingLeft: 24,
    paddingRight: 8,
    gap: 16,
  },
  noAlertsText: {
    fontSize: 13,
    color: '#9C9690',
    paddingHorizontal: 24,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 18,
    width: 175,
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconRed: {
    backgroundColor: '#FFEBEE',
  },
  alertIconOrange: {
    backgroundColor: '#FFF3E0',
  },
  alertIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  alertCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  alertCardSub: {
    fontSize: 11,
    color: '#9C9690',
    marginBottom: 12,
  },
  alertCardBtn: {
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E5DF',
  },
  alertCardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1817',
  },
  referBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 20,
    marginHorizontal: 24,
    marginTop: 24,
    justifyContent: 'space-between',
  },
  referLeft: {
    flex: 1.5,
  },
  referTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  referSub: {
    fontSize: 11,
    color: '#7C7672',
    marginBottom: 12,
  },
  referBtn: {
    backgroundColor: '#FFF0EA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  referBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BD632F',
  },
  claimInput: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    fontSize: 12,
    color: '#1A1817',
  },
  referImage: {
    width: 70,
    height: 70,
    marginLeft: 10,
    flex: 1,
  },
  marketCategoriesRow: {
    paddingLeft: 24,
    paddingRight: 8,
    gap: 12,
    paddingBottom: 4,
  },
  marketCategoryCard: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketCategoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketCategoryIconText: {
    fontSize: 20,
  },
  marketCategoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  marketRatesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    marginHorizontal: 24,
    marginTop: 24,
    padding: 20,
  },
  ratesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  ratesDropdown: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratesDropdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C7672',
  },
  ratesList: {
    gap: 12,
    marginBottom: 20,
  },
  ratesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  ratesItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratesItemDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFE9',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
  },
  ratesItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  ratesItemPrice: {
    fontSize: 11,
    color: '#7C7672',
  },
  ratesChevron: {
    fontSize: 12,
    color: '#BD632F',
  },
  viewMarketBtn: {
    backgroundColor: '#BD632F',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMarketBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
