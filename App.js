import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, SafeAreaView, Platform, Animated, ActivityIndicator } from 'react-native';

import { NotesProvider } from './context/NotesContext';
import { EventsProvider } from './context/EventsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { themes } from './constants/theme';

import NotesScreen from './screens/NotesScreen';
import CalendarScreen from './screens/CalendarScreen';
import AIScreen from './screens/AIScreen';
import AuthScreen from './screens/AuthScreen';

const TAB_WIDTH = 100;
const TABS = ['Calendar', 'AI', 'Notes'];

function MainApp() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [activeTab, setActiveTab] = useState('AI');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const theme = isDark ? themes.dark : themes.light;

  const { user, loading, logout, isAuthenticated } = useAuth();

  // Animation values
  const tabIndicatorPosition = useRef(new Animated.Value(1)).current;
  const themeToggleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const newIndex = TABS.indexOf(activeTab);
    Animated.spring(tabIndicatorPosition, {
      toValue: newIndex,
      tension: 68,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const toggleTheme = () => {
    Animated.sequence([
      Animated.timing(themeToggleRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(themeToggleRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Calendar':
        return <CalendarScreen theme={theme} />;
      case 'AI':
        return <AIScreen theme={theme} />;
      case 'Notes':
        return <NotesScreen theme={theme} />;
      default:
        return <AIScreen theme={theme} />;
    }
  };

  const themeButtonRotation = themeToggleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const indicatorTranslateX = tabIndicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2],
  });

  // Show loading screen
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Show auth screen if not logged in
  if (!isAuthenticated) {
    return <AuthScreen theme={theme} />;
  }

  return (
    <NotesProvider>
      <EventsProvider>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Modern Header */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.title, { color: theme.text }]}>Timeline</Text>
                </View>
                <View style={styles.headerRight}>
                  {/* User Avatar */}
                  <TouchableOpacity
                    onPress={() => setShowUserMenu(!showUserMenu)}
                    style={[styles.avatarButton, { backgroundColor: theme.primaryLight }]}
                  >
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                      {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </TouchableOpacity>
                  {/* Theme Toggle */}
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={[styles.themeButton, { backgroundColor: theme.backgroundSecondary }]}
                    activeOpacity={0.7}
                  >
                    <Animated.Text style={[styles.themeIcon, { transform: [{ rotate: themeButtonRotation }] }]}>
                      {isDark ? '☀️' : '🌙'}
                    </Animated.Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <View style={[styles.userMenu, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {user?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                      {user?.email}
                    </Text>
                  </View>
                  <View style={[styles.menuDivider, { backgroundColor: theme.divider }]} />
                  <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.dangerLight }]}
                    onPress={handleLogout}
                  >
                    <Text style={[styles.logoutText, { color: theme.danger }]}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.headerLine, { backgroundColor: theme.divider }]} />
            </View>

            {/* Modern Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
              <View style={styles.tabContainer}>
                {/* Animated indicator */}
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    {
                      backgroundColor: theme.primaryLight,
                      transform: [{ translateX: indicatorTranslateX }],
                    }
                  ]}
                />
                {TABS.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={styles.tab}
                    onPress={() => {
                      setActiveTab(tab);
                      setShowUserMenu(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.tabText,
                      { color: activeTab === tab ? theme.primary : theme.textSecondary },
                      activeTab === tab && styles.tabTextActive
                    ]}>
                      {tab}
                    </Text>
                    {activeTab === tab && (
                      <View style={[styles.tabDot, { backgroundColor: theme.primary }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.tabBarLine, { backgroundColor: theme.divider }]} />
            </View>

            {/* Screen Content */}
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setShowUserMenu(false)}
            >
              {renderScreen()}
            </TouchableOpacity>
          </SafeAreaView>
          <StatusBar style={isDark ? "light" : "dark"} />
        </View>
      </EventsProvider>
    </NotesProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 16,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 22,
  },
  userMenu: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 110 : 78,
    right: 16,
    width: 220,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  menuDivider: {
    height: 1,
    marginBottom: 12,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerLine: {
    height: 1,
    marginHorizontal: 20,
  },
  tabBar: {
    paddingTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    left: 20,
    top: 4,
    width: TAB_WIDTH,
    height: 36,
    borderRadius: 18,
  },
  tab: {
    width: TAB_WIDTH,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  tabBarLine: {
    height: 1,
    marginTop: 8,
  },
});


