import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SystemColors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function ResultPage() {
  const params = useLocalSearchParams();
  
  
    const decodedImageUrl = params.imageUrl
    const decodedResultUrl = params.resultUrl
    

    console.log('Decoded imageUrl:', decodedImageUrl);
    console.log('Decoded resultUrl:', decodedResultUrl);

    const handleClose = () => {
      router.push('/');  // Go back to home page
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Image 
            source={require('../../assets/icons/closeIcon.png')} 
            style={styles.closeIcon}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: String(decodedImageUrl) }}
              style={styles.voiceImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.voiceName, Typography.bodyBold]}>{params.voice}</Text>
          <Text style={[styles.prompt, Typography.bodyRegular]}>{params.prompt}</Text>
          
          {/* Add your audio player component here using resultUrl */}
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
    paddingHorizontal: 20,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: SystemColors.dark,
  },
  voiceImage: {
    width: '100%',
    height: '100%',
  },
  voiceName: {
    color: SystemColors.white,
    marginBottom: 8,
  },
  prompt: {
    color: SystemColors.white_70,
    textAlign: 'center',
    marginBottom: 24,
  },
}); 