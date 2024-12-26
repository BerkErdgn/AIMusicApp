import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SystemColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { generateMusic } from '../../data/api/music';
import { BlurView } from 'expo-blur';
import { Canvas, Circle, RadialGradient, Rect, vec } from "@shopify/react-native-skia";


/**
 * Müzik oluşturma sayfası bileşeni
 * Müzik oluşturma sürecini ve yükleme animasyonunu yönetir
 */
export default function GeneratingPage() {
  const { prompt, voice, category, imageUrl } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Sayfa yüklendiğinde müzik oluşturma işlemini başlatır
   */
  useEffect(() => {
    handleGenerateMusic();
  }, []);

  /**
   * Geri butonuna basıldığında önceki sayfaya döner
   */
  const handleClose = () => {
    router.back();
  };

  /**
   * Müzik oluşturma işlemini gerçekleştirir
   * 1. Loading durumunu aktif eder
   * 2. API'yi çağırır ve müzik oluşturur
   * 3. Başarılı olursa result sayfasına yönlendirir
   * 4. Hata durumunda console'a log atar
   * 5. İşlem bitince loading durumunu kapatır
   */
  const handleGenerateMusic = async () => {
    try {
      setIsLoading(true);
      const data = await generateMusic({ prompt, voice, category } as any);

      const encodedResultUrl = encodeURIComponent(data.resultUrl);
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
        <Canvas style={styles.gradientContainer}>
          <Circle cx={150} cy={150} r={150}>
              <RadialGradient
                c={vec(150, 150)}
                r={200}
                colors={[
                  'rgba(247, 108, 198, 0.3)',
                  'rgba(84, 38, 215, 0.2)',
                ]}
                positions={[0.2, 0.4, 0.7, 1]}
              />
            </Circle>
          </Canvas>
          <BlurView 
            intensity={0}
            tint='systemChromeMaterialDark'
            style={styles.blurContainer}
          >
            <VideoView
              player={player}
              style={styles.loadingAnimation}
            />
          </BlurView>
        </View>
        <Text style={[styles.title, Typography.largeTitle]}>Generating</Text>
        <Text style={[styles.subtitle, Typography.bodyRegular]}>
          It may take up to few minutes for you to recive an AI- generated speech. You can find your voice record in Library.
        </Text>
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
    width: 300,
    height: 300,
    position: 'absolute',
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
  blurContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
}); 