import React from 'react';
import {View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors, typography} from '../constants/theme';

// Import custom icons
import {
  InfinityIcon,
  NestedTrianglesIcon,
  MemoryNodesIcon,
  OffsetSquaresIcon,
  FlowerIcon,
} from '../components/icons/TabIcons';

// Import screens
import {ChatScreenV2 as ChatScreen} from '../screens/ChatScreenV2';
import {MemoryScreen} from '../screens/MemoryScreen';
import {AutonomousScreen} from '../screens/AutonomousScreen';
import {ShareScreen} from '../screens/ShareScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {ConversationDetailScreen} from '../screens/ConversationDetailScreen';
import {ConversationListScreen} from '../screens/ConversationListScreen';
import {PersonaManagementScreen} from '../screens/PersonaManagementScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  ConversationDetail: {conversationId: string};
  ConversationList: undefined;
  PersonaManagement: undefined;
  PersonaEdit: {personaId: string | null};
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

// Custom icon wrapper with animation potential
const IconWrapper = ({children, focused}: {children: React.ReactNode; focused: boolean}) => (
  <View style={[
    styles.iconWrapper,
    focused && styles.iconWrapperFocused
  ]}>
    {children}
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderPrimary,
          borderTopWidth: 0.5,
          height: 85,
          paddingBottom: 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textQuaternary,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.mono,
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginTop: 6,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}>
      <Tab.Screen
        name="Autonomous"
        component={AutonomousScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <IconWrapper focused={focused}>
              <InfinityIcon color={color} size={26} />
            </IconWrapper>
          ),
          tabBarLabel: 'Auto',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <IconWrapper focused={focused}>
              <NestedTrianglesIcon color={color} size={26} />
            </IconWrapper>
          ),
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen
        name="Memory"
        component={MemoryScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <IconWrapper focused={focused}>
              <MemoryNodesIcon color={color} size={26} />
            </IconWrapper>
          ),
          tabBarLabel: 'Memory',
        }}
      />
      <Tab.Screen
        name="Share"
        component={ShareScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <IconWrapper focused={focused}>
              <OffsetSquaresIcon color={color} size={26} />
            </IconWrapper>
          ),
          tabBarLabel: 'Share',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <IconWrapper focused={focused}>
              <FlowerIcon color={color} size={26} />
            </IconWrapper>
          ),
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
      <Stack.Screen
        name="ConversationList"
        component={ConversationListScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
          cardOverlayEnabled: true,
        }}
      />
      <Stack.Screen
        name="PersonaManagement"
        component={PersonaManagementScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
          cardOverlayEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  iconWrapperFocused: {
    backgroundColor: `${colors.textPrimary}08`,
  },
});