import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import type { RootState } from '@/store/store';

const { width } = Dimensions.get('window');

function getIconName(routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case 'index':
      return isFocused ? 'home' : 'home-outline';
    case 'animals':
      return isFocused ? 'paw' : 'paw-outline';
    case 'doctors':
      return isFocused ? 'medical' : 'medical-outline';
    case 'market':
      return isFocused ? 'storefront' : 'storefront-outline';
    case 'profile':
      return isFocused ? 'person' : 'person-outline';
    case 'doctor-home':
      return isFocused ? 'home' : 'home-outline';
    case 'doctor-bookings':
      return isFocused ? 'calendar' : 'calendar-outline';
    case 'doctor-availability':
      return isFocused ? 'time' : 'time-outline';
    case 'doctor-messages':
      return isFocused ? 'chatbubbles' : 'chatbubbles-outline';
    default:
      return 'ellipse-outline';
  }
}

function getLabel(routeName: string) {
  switch (routeName) {
    case 'index':
      return 'Home';
    case 'animals':
      return 'Animals';
    case 'doctors':
      return 'Doctors';
    case 'market':
      return 'Market';
    case 'profile':
      return 'Profile';
    case 'doctor-home':
      return 'Home';
    case 'doctor-bookings':
      return 'Calendar';
    case 'doctor-availability':
      return 'Schedule';
    case 'doctor-messages':
      return 'Chat';
    default:
      return routeName;
  }
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarBackground}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          if (options.tabBarItemStyle?.display === 'none') {
            return null;
          }
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = getIconName(route.name, isFocused);
          const label = getLabel(route.name);

          return (
            <View key={route.key} style={styles.tabItemContainer}>
              {isFocused ? (
                /* Floating Active Tab with Badge Circle */
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: true }}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.floatingActiveButton}
                  activeOpacity={0.85}
                >
                  <View style={styles.floatingInnerCircle}>
                    <View style={styles.iconCircleBadge}>
                      <Ionicons name={iconName} size={22} color="#BD632F" />
                    </View>
                  </View>
                  <Text style={styles.labelActive}>{label}</Text>
                </TouchableOpacity>
              ) : (
                /* Inactive Tab */
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <Ionicons name={iconName} size={22} color="#9C9690" style={{ marginBottom: 3 }} />
                  <Text style={styles.labelInactive}>{label}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AppTabs() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isDoctor = user?.role === 'doctor';

  return (
    <Tabs
      initialRouteName={isDoctor ? 'doctor-home' : 'index'}
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ href: isDoctor ? null : undefined }} />
      <Tabs.Screen name="animals" options={{ href: isDoctor ? null : undefined }} />
      <Tabs.Screen name="doctors" options={{ href: isDoctor ? null : undefined }} />
      <Tabs.Screen name="market" options={{ href: isDoctor ? null : undefined }} />
      <Tabs.Screen name="doctor-home" options={{ href: isDoctor ? undefined : null }} />
      <Tabs.Screen name="doctor-bookings" options={{ href: isDoctor ? undefined : null }} />
      <Tabs.Screen name="doctor-availability" options={{ href: isDoctor ? undefined : null }} />
      <Tabs.Screen name="doctor-messages" options={{ href: isDoctor ? undefined : null }} />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 80,
    backgroundColor: 'transparent',
  },
  tabBarBackground: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelInactive: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9C9690',
  },
  floatingActiveButton: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 4,
  },
  iconCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BD632F',
  },
});
