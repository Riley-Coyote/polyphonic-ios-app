import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {RootNavigator} from './src/navigation/RootNavigator';
import {ThemeProvider} from './src/contexts/ThemeContext';
import {StoreProvider} from './src/store/StoreProvider';
import {darkTheme} from './src/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Always use dark mode for Polyphonic
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setBackgroundColor('#000000');
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <ThemeProvider>
            <SafeAreaProvider>
              <NavigationContainer theme={darkTheme}>
                <StatusBar
                  barStyle="light-content"
                  backgroundColor="#000000"
                  translucent={false}
                />
                <RootNavigator />
              </NavigationContainer>
            </SafeAreaProvider>
          </ThemeProvider>
        </StoreProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;