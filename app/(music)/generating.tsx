import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SystemColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function GeneratingPage() {
  const { prompt, voice, category, imageUrl } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleGenerateMusic();
  }, []);

  const handleClose = () => {
    router.back();
  };


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

        const encodedResultUrl = encodeURIComponent(data.resultUrl as string);
        const encodedImageUrl = encodeURIComponent(imageUrl as string);

        router.replace({
          pathname: "/result",
          params: {
            prompt,
            voice,
            imageUrl: encodedImageUrl,
            resultUrl: encodedResultUrl
          }
        });

      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const videoSource = 'https://s3-figma-videos-production-sig.figma.com/video/969933023608660558/TEAM/bf4a/db11/-514d-4c6d-876d-a4d3930d3c80?Expires=1736121600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=LIrAd9RMJSMOnm3ck4zaaNlHRc5A5NfBsI9gzHWGI6yNEXQtdZZg7nawGeuj-mXOXI1daR8zTcQO63t1RZeyKPeCuGDEgmk9BNPC23fIuz2RumA8OuYMvOA6vqEllCcMyYg1slSg5Y-mhMIgdxT0PJfRbstdQ7myTbIEyJzhJ7gjUEf3zjKK1cUnODxvWz6UuUW1RnVqb9UGJUgZ6m1y7oeHQObn-jVp84ZFpAjA8CLYPWTkoYgJh7zVleP4TNtPDQOFz2c41wGxwTZPQaDgqIJQHnfskn8GPrQpIM-05k0jsedwTW11RORybUHRpSLoReBcBjOMFA5Gv7SkD4sv5g__'

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play()
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Image 
          source={require('../../assets/icons/closeIcon.png')} 
          style={styles.closeIcon}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.animationContainer}>
            <LinearGradient
              colors={[
                'rgba(247, 108, 198, 0.3)',
                'rgba(84, 38, 215, 0.2)'
              ]}
              style={styles.gradientContainer}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 1, y: 1 }}
            >
              
              <VideoView
                player={player}
                style={styles.loadingAnimation}
              />

            </LinearGradient> 
        </View>
        <Text style={[styles.title, Typography.largeTitle]}>Generating</Text>
        <Text style={[styles.subtitle, Typography.bodyRegular]}>It may take up to few minutes for you to recive an AI- generated speech. You can find your voice record in Library.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SystemColors.black,
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
  closeIcon: {
    width: 13,
    height: 13,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingAnimation: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: SystemColors.black,
  },
  title: {
    marginTop: 40,
    color: SystemColors.white,
    marginBottom: 8,
  },
  subtitle: {
    marginHorizontal: 30,
    textAlign: 'center',
    color: SystemColors.white_70,
  },
}); 