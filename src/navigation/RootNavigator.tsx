import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {colors, typography} from '../constants/theme';

// Import screens
import {ChatScreen} from '../screens/ChatScreen';
import {MemoryScreen} from '../screens/MemoryScreen';
import {AutonomousScreen} from '../screens/AutonomousScreen';
import {ShareScreen} from '../screens/ShareScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {ConversationDetailScreen} from '../screens/ConversationDetailScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  ConversationDetail: {conversationId: string};
};

export type MainTabParamList = {
  Chat: undefined;
  Memory: undefined;
  Autonomous: undefined;
  Share: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar icons
const TabBarIcon = ({name, color}: {name: string; color: string}) => (
  <Icon name={name} size={24} color={color} />
);

// Special Polyphonic symbol icons (we'll use text for these)
const PolyphonicIcon = ({symbol, color}: {symbol: string; color: string}) => (
  <Icon name="circle" size={24} color={color} />
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderPrimary,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.mono,
          fontSize: typography.fontSize.xs,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}>
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({color}) => <TabBarIcon name="message-circle" color={color} />,
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen
        name="Memory"
        component={MemoryScreen}
        options={{
          tabBarIcon: ({color}) => <TabBarIcon name="database" color={color} />,
          tabBarLabel: 'Memory',
        }}
      />
      <Tab.Screen
        name="Autonomous"
        component={AutonomousScreen}
        options={{
          tabBarIcon: ({color}) => <TabBarIcon name="cpu" color={color} />,
          tabBarLabel: 'Auto',
        }}
      />
      <Tab.Screen
        name="Share"
        component={ShareScreen}
        options={{
          tabBarIcon: ({color}) => <TabBarIcon name="share-2" color={color} />,
          tabBarLabel: 'Share',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color}) => <TabBarIcon name="settings" color={color} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  // For now, we'll skip onboarding and go straight to main
  const isOnboarded = true;

  return (
    <Stack.Navigator
      initialRouteName={isOnboarded ? 'Main' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.bgPrimary},
      }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="ConversationDetail"
        component={ConversationDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.bgPrimary,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontFamily: typography.fontFamily.mono,
            fontSize: typography.fontSize.lg,
          },
          title: 'Conversation',
        }}
      />
    </Stack.Navigator>
  );
}