import { Tabs } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: '#A1A9B6', tabBarStyle: { height: 76, paddingBottom: 12, paddingTop: 8, borderTopColor: '#EEF0F4', backgroundColor: '#FFFFFF' }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'ホーム', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="calendar" options={{ title: 'カレンダー', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="add" options={{ title: '', tabBarLabel: '', tabBarIcon: () => <Ionicons name="add" color="#fff" size={27} />, tabBarButton: ({ onPress, accessibilityState }) => <Pressable onPress={onPress} accessibilityState={accessibilityState} style={{ width: 56, height: 56, marginTop: -14, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 30, lineHeight: 32 }}>＋</Text></Pressable> }} />
    <Tabs.Screen name="finance" options={{ title: '家計簿', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="analytics" options={{ title: '分析', tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" color={color} size={size} /> }} />
  </Tabs>;
}
