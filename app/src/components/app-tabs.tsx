import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

const { width } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {/* Background card with top shadow */}
      <View style={styles.tabBarBackground}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
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

          // Emojis for icons
          const getIcon = (routeName: string) => {
            switch (routeName) {
              case 'index':
                return '🏠';
              case 'animals':
                return '🐾';
              case 'doctors':
                return '🩺';
              case 'market':
                return '🏪';
              case 'profile':
                return '👤';
              case 'doctor-bookings':
                return '📅';
              case 'doctor-availability':
                return '🗓️';
              case 'doctor-messages':
                return '💬';
              default:
                return '📍';
            }
          };

          // Display label mapping
          const getLabel = (routeName: string) => {
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
              case 'doctor-bookings':
                return 'Bookings';
              case 'doctor-availability':
                return 'Availability';
              case 'doctor-messages':
                return 'Messages';
              default:
                return routeName;
            }
          };

          return (
            <View key={route.key} style={styles.tabItemContainer}>
              {isFocused ? (
                /* Floated Active Tab design matching the design screenshot */
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: true }}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.floatingActiveButton}
                  activeOpacity={0.85}
                >
                  <View style={styles.floatingInnerButton}>
                    <Text style={styles.floatingIcon}>
                      {getIcon(route.name)}
                    </Text>
                  </View>
                  <Text style={styles.labelActive}>
                    {getLabel(route.name)}
                  </Text>
                </TouchableOpacity>
              ) : (
                /* Flat Inactive Tab design */
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconInactive}>
                    {getIcon(route.name)}
                  </Text>
                  <Text style={styles.labelInactive}>
                    {getLabel(route.name)}
                  </Text>
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
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {isDoctor ? (
        <>
          <Tabs.Screen name="doctor-bookings" />
          <Tabs.Screen name="doctor-availability" />
          <Tabs.Screen name="doctor-messages" />
          <Tabs.Screen name="profile" />
        </>
      ) : (
        <>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="animals" />
          <Tabs.Screen name="doctors" />
          <Tabs.Screen name="market" />
          <Tabs.Screen name="profile" />
        </>
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 90,
    backgroundColor: 'transparent',
  },
  tabBarBackground: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
  },
  iconInactive: {
    fontSize: 20,
    opacity: 0.6,
    color: '#9C9690',
    marginBottom: 4,
  },
  labelInactive: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9C9690',
  },
  floatingActiveButton: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingInnerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 4,
  },
  floatingIcon: {
    fontSize: 22,
    color: '#BD632F',
  },
  labelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BD632F',
  },
});
