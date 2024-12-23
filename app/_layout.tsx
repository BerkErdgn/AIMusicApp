import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, SafeAreaView } from 'react-native';
import { SystemColors } from '../constants/Colors';

export default function RootLayout() {
  return (
        <SafeAreaView style={{ flex: 1, backgroundColor: SystemColors.black }}>
          <StatusBar style="light" translucent={false} backgroundColor="black" />
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: SystemColors.black,
              },
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{ 
                title: 'Create Music',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="(music)/generating" 
              options={{ 
                title: 'Generating',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="(music)/result" 
              options={{ 
                title: 'Your Music',
                headerShown: false 
              }} 
            />
          </Stack>
        </SafeAreaView>
  );
}
