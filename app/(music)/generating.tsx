import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SystemColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useState, useEffect } from 'react';

export default function GeneratingPage() {
  const { prompt, voice, category } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleGenerateMusic();
  }, []);

  const handleGenerateMusic = async () => {
    try {
      const response = await fetch('https://us-central1-ai-video-40ecf.cloudfunctions.net/startMusicGenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, voice, category })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
        console.log(data)
        // Handle successful generation
        // You might want to navigate to result page or handle the response
      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating music:', error);
      // Handle error - maybe show error message or navigate back
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={SystemColors.white} style={styles.loader} />
      <Text style={[styles.text, Typography.largeTitle]}>Generating Voice...</Text>
      <Text style={[styles.promptText, Typography.bodyRegular]}>"{prompt}"</Text>
      {voice && <Text style={[styles.voiceText, Typography.caption2]}>Using {voice}'s voice</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SystemColors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loader: {
    marginBottom: 24,
  },
  text: {
    color: SystemColors.white,
    marginBottom: 16,
  },
  promptText: {
    color: SystemColors.white_70,
    textAlign: 'center',
    marginBottom: 8,
  },
  voiceText: {
    color: SystemColors.primaryColor1,
  }
}); 