import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, PanResponder, GestureResponderEvent, PanResponderGestureState, Platform, ScrollView, Alert, ToastAndroid, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SystemColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');

export default function ResultPage() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const params = useLocalSearchParams();
  const decodedImageUrl = params.imageUrl;
  const decodedResultUrl = params.resultUrl;

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.stopAsync().then(() => {
          sound.unloadAsync();
        });
      }
    };
  }, []);

  /**
   * Loads the audio file and prepares the player
   * Called automatically when the page loads
   */
  const loadAudio = async () => {
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: String(decodedResultUrl) },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(audioSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  /**
   * Tracks and updates the playback status
   * - Updates duration
   * - Updates position
   * - Updates playing state
   * - Handles track completion
   */
  const onPlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      // If track finished and not looping
      if (status.didJustFinish && !isLooping) {
        setIsPlaying(false);
      }
    }
  };

  /**
   * Handles play/pause functionality
   * Called when the play/pause button is pressed
   */
  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        // If track is finished or near the end
        if (position >= duration - 100) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
      await loadAudio();
    }
  };

  /**
   * Converts milliseconds to "minutes:seconds" format
   * Example: 61000ms -> "1:01"
   */
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  /**
   * Handles closing the page and cleaning up audio
   * Called when the back button is pressed
   */
  const handleClose = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    router.back();
  };

  /**
   * Handles progress bar touch and drag operations
   * - Captures touch start
   * - Tracks drag movement
   * - Jumps to new position on release
   */
  const handleProgressBarPress = async (event: GestureResponderEvent) => {
    if (!sound || !progressBarWidth) return;

    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(locationX / progressBarWidth, 1));
    const newPosition = percentage * duration;

    try {
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    } catch (error) {
      console.error('Progress bar press error:', error);
    }
  };

  /**
   * Updates PanResponder
   * - Captures touch start
   * - Tracks drag movement
   * - Jumps to new position on release
   */
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: async () => {
      if (!sound) return;
      setIsSeeking(true);
    },
    onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (!progressBarWidth) return;
      
      // Calculate more accurate position using gesture state
      const touchX = Math.max(0, Math.min(gestureState.moveX - 16, progressBarWidth));
      const percentage = touchX / progressBarWidth;
      const newPosition = percentage * duration;
      setSeekPosition(newPosition);
    },
    onPanResponderRelease: async () => {
      if (!sound) return;
      
      try {
        await sound.setPositionAsync(seekPosition);
        setPosition(seekPosition);
      } catch (error) {
        console.error('Seeking error:', error);
      } finally {
        setIsSeeking(false);
      }
    },
  });

  /**
   * Toggles loop mode on/off
   * Called when the loop button is pressed
   */
  const handleLoopToggle = async () => {
    if (!sound) return;
    
    try {
      const newLoopValue = !isLooping;
      await sound.setIsLoopingAsync(newLoopValue);
      setIsLooping(newLoopValue);
    } catch (error) {
      console.error('Loop toggle error:', error);
    }
  };

  /**
   * Handles sharing the song and prompt text
   * Called when the Share menu item is clicked
   */
  const handleShare = async () => {
    try {
      const filename = `AI_Music_${Date.now()}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(
        decodedResultUrl as string,
        fileUri
      );

      if (uri) {
        // Share the file
        const UTI = 'public.audio';
        await Sharing.shareAsync(uri, {
          mimeType: 'audio/mpeg',
          dialogTitle: `AI Music by ${params.voice}`,
          UTI: UTI
        });

        // Clean up temporary file
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share music');
    }
    setIsMenuVisible(false);
  };

  /**
   * Copies prompt text to clipboard and shows notification
   * Called when the Copy Text menu item is clicked
   */
  const handleCopyText = async () => {
    await Clipboard.setStringAsync(params.prompt as string);
    setIsMenuVisible(false);
    
    // Show Alert for iOS, Toast for Android
    if (Platform.OS === 'ios') {
      Alert.alert('Copied', 'Text has been copied to clipboard', [
        { text: 'OK', style: 'cancel' }
      ], {
        cancelable: true,
        userInterfaceStyle: 'dark'
      });
    } else {
      ToastAndroid.show('Text copied to clipboard', ToastAndroid.SHORT);
    }
  };

  /**
   * Handles downloading music to device
   * - Checks permissions
   * - Downloads file
   * - Saves to media library
   * Called when the Download button is pressed
   */
  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please allow storage access to save music to your device',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      Alert.alert('Downloading...', 'Please wait while we download your music');

      const filename = `AI_Music_${Date.now()}.mp3`;
      const fileUri = FileSystem.documentDirectory + filename;

      const { uri } = await FileSystem.downloadAsync(
        decodedResultUrl as string,
        fileUri
      );

      if (uri) {
        // Save to MediaLibrary only, don't create album
        await MediaLibrary.createAssetAsync(uri);
        Alert.alert('Success', 'Music has been downloaded successfully!');
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download music. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Image 
            source={require('../../assets/icons/previousIcon.png')} 
            style={styles.closeIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, Typography.bodyBold]}>{params.voice}</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Text style={styles.menuDots}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: String(decodedImageUrl) }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={[styles.loopBadge, isLooping && styles.loopBadgeActive]}
            onPress={handleLoopToggle}
          >
            <Image 
              source={require('../../assets/icons/replayIcon.png')}
              style={[styles.replayIcon, isLooping && styles.replayIconActive]}
            />
            <Text style={[styles.loopText, isLooping && styles.loopTextActive]}>Loop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playerContainer}>
          <View style={styles.progressSection}>
            <TouchableOpacity 
              style={styles.progressBar}
              onPress={handleProgressBarPress}
              onLayout={(event) => {
                setProgressBarWidth(event.nativeEvent.layout.width);
              }}
            >
              <View 
                style={[
                  styles.progress, 
                  { width: `${((isSeeking ? seekPosition : position) / duration) * 100}%` }
                ]} 
              />
              <View 
                {...panResponder.panHandlers}
                style={[
                  styles.progressKnob,
                  { left: `${((isSeeking ? seekPosition : position) / duration) * 100}%` }
                ]} 
              />
            </TouchableOpacity>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(isSeeking ? seekPosition : position)}
              </Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <View style={[styles.playIcon, isPlaying && styles.pauseIcon]} />
          </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.textLabel}>Text</Text>
          <View style={styles.promptContainer}>
            <Text style={[styles.promptText]}>{params.prompt}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.80}
          onPress={handleDownload}
        >
          <LinearGradient
            colors={['#F76CC6', '#5426D7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.downloadButton}
          >
            <Text style={styles.downloadText}>Download</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Share</Text>
                <Image 
                  source={require('../../assets/icons/shareIcon.png')}
                  style={styles.menuItemIcon}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleCopyText}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Copy Text</Text>
                <Image 
                  source={require('../../assets/icons/copyIcon.png')}
                  style={styles.menuItemIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SystemColors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    color: SystemColors.white,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 13,
    height: 13,
  },
  menuButton: {
    padding: 8,
  },
  menuDots: {
    color: SystemColors.white,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: width - 32,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  loopBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#F76CC6CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  loopBadgeActive: {
    borderColor: '#F76CC6',
    backgroundColor: '#F76CC6CC',
  },
  replayIcon: {
    width: 14,
    height: 14,
    tintColor: SystemColors.white_50,
  },
  replayIconActive: {
    tintColor: SystemColors.white,
  },
  loopText: {
    color: SystemColors.white_50,
    fontSize: 14,
    fontWeight: '500',
  },
  loopTextActive: {
    color: SystemColors.white,
  },
  playerContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  progressSection: {
    marginTop: 16,
    flex: 1,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: SystemColors.white_50,
    borderRadius: 2,
    marginBottom: 4,
    width: '100%',
    position: 'relative',
  },
  progress: {
    height: '100%',
    backgroundColor: SystemColors.white,
    borderRadius: 2,
  },
  progressKnob: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: SystemColors.white,
    top: -4,
    transform: [{ translateX: -6 }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    width: '100%',
  },
  timeText: {
    color: SystemColors.white_70,
    fontSize: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SystemColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: SystemColors.black,
    marginLeft: 4,
  },
  textContainer: {
    marginTop: 8,
  },
  textLabel: {
    color: SystemColors.white,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'left',
    marginBottom: 8,
  },
  promptContainer: {
    backgroundColor: '#231E27',
    borderRadius: 12,
    padding: 16,
  },
  promptText: {
    color: SystemColors.white,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'left',
  },
  downloadButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  downloadText: {
    color: SystemColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  pauseIcon: {
    width: 16,
    height: 16,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: SystemColors.black,
    marginLeft: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 40,
  },
  menuModal: {
    position: 'absolute',
    width: 230,
    top: 80,
    right: 16,
    backgroundColor: 'rgba(35, 30, 39, 0.8)',
    borderRadius: 12,
    padding: 4,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7.24,
    },
    shadowOpacity: 0.1,
    shadowRadius: 57.95,
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  menuItemText: {
    color: SystemColors.white,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    lineHeight: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 20,
  },
  menuItemIcon: {
    width: 16,
    height: 16,
    tintColor: SystemColors.white,
  },
}); 