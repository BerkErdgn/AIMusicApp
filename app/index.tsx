import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SystemColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/useThemeColor';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Voice {
  imageUrl: string;
  category: string;
  order: number;
  name: string;
}

interface ApiResponse {
  objects: Voice[];
}

const INSPIRATION_TEXTS = [
  "an atmospheric sleep soundscape with distant celestial melodies, creating a sense of floating in a calm night sky",
  "a dreamy music box melody that transports listeners to a serene and restful dreamland",
  "a calming meditation piece with the sounds of falling rain, distant thunder, and gentle wind chimes",
  "an evolving ambient soundscape that progresses through the changing seasons, from the blossoming of spring to the hush of winter",
  "a folk rock song that combines acoustic instruments with rock elements, telling a storytelling narrative",
  "a progressive rock epic with intricate instrumental sections, dynamic shifts, and thought-provoking melodies",
  "an orchestral overture reminiscent of the Classical era, featuring intricate orchestration and well-defined musical themes",
  "a meditation ambience with soft, pulsating tones that guide the listener into a deep state of relaxation and inner reflection",
  "a meditative drone piece that mirrors the rhythmic patterns of ocean waves, gradually building in intensity and subsiding like the tide"
];

export default function MusicGenerator() {
  const { theme, isDark } = useThemeColor();
  const [categories, setCategories] = useState<Category[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://us-central1-ai-video-40ecf.cloudfunctions.net/getVoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data: ApiResponse = await response.json();
      
      // Extract unique categories and create category objects
      const uniqueCategories = ['All', ...new Set(data.objects.map(item => item.category))];
      const categoryObjects = uniqueCategories.map(category => ({
        id: category.toLowerCase(),
        name: category,
        image: ''
      }));

      setCategories(categoryObjects);
      setVoices(data.objects.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([{ id: 'all', name: 'All', image: '' }]);
    }
  };

  // Filter voices based on selected category
  const filteredVoices = voices.filter(voice => 
    selectedCategory === 'All' || voice.category === selectedCategory
  );

  const handleInspirationClick = () => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_TEXTS.length);
    setPrompt(INSPIRATION_TEXTS[randomIndex]);
  };

  const handleContinue = () => {
    if (!prompt) return;
    
    router.push({
      pathname: "/generating",
      params: { 
        prompt,
        voice: selectedVoice,
        category: selectedCategory !== 'All' ? selectedCategory : ''
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: SystemColors.black }]}>
      <Text style={styles.headerText}>AI Voice</Text>
      <View style={[styles.inputContainer]}>
        <TextInput
          style={[styles.input, Typography.caption2, { color: theme.text }]}
          placeholder="Write a text and let AI turn it into a speech with the voice of your favorite character"
          placeholderTextColor={isDark ? SystemColors.white_50 : SystemColors.gray}
          multiline
          value={prompt}
          onChangeText={setPrompt}
        />
        <TouchableOpacity 
          style={styles.inspirationButton}
          onPress={handleInspirationClick}
        >
          <View style={styles.inspirationContent}>
            <Text style={styles.inspirationText}>
              Get inspiration
            </Text>
            <Image 
              source={require('../assets/icons/bulbIcon.png')}
              style={styles.bulbIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, Typography.largeTitle, { color: theme.text }]}>
        Pick a Voice
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScrollView}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.name)}
            style={styles.categoryWrapper}
          >
            <View
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.selectedCategoryButton
              ]}
            >
              <Text style={[
                styles.categoryText,
                Typography.bodyRegular,
                selectedCategory === category.name && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.voicesContainer}>
        <View style={styles.voicesGrid}>
          {filteredVoices.map(voice => (
            <TouchableOpacity
              key={voice.order}
              style={[
                styles.voiceItem,
                { backgroundColor: isDark ? SystemColors.black : SystemColors.white_85 },
                
              ]}
              onPress={() => setSelectedVoice(voice.name)}
            >
              <View style={[styles.imageContainer,selectedVoice === voice.name && styles.selectedVoiceItem]}>
                <Image
                  source={{ uri: voice.imageUrl }}
                  style={styles.voiceImage}
                />
                {selectedVoice === voice.name && (
                  <View style={styles.imageOverlay}>
                    <View style={styles.voiceSelectedOverlay}>
                      <Image 
                        source={require('../assets/icons/selectedCategoryIcon.png')}
                        style={styles.voiceSelectedIcon}
                      />
                    </View>
                  </View>
                )}
              </View>
              <Text style={[styles.voiceName, Typography.caption2, { color: theme.text }]}>
                {voice.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        onPress={handleContinue}
        disabled={!prompt}
      >
        <LinearGradient
          colors={!prompt ? ['#4A203B', '#4A203B'] : [...SystemColors.linearGradient] as const}
          style={styles.generateButton}
        >
          <Text style={[styles.generateText, Typography.bodyBold]}>
            Continue
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: SystemColors.black,
  },
  headerText: {
    color: SystemColors.white,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    backgroundColor:"#231E27",
    marginBottom: 24,
  },
  input: {
    marginLeft: 8,
    marginRight: 8,
    height: 65,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'left',
  },
  inspirationButton: {
    height: 32,
    borderTopLeftRadius: 64,
    backgroundColor: 'transparent',
  },
  inspirationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 7,
    paddingHorizontal: 10,
    gap: 4,
    justifyContent: 'flex-start',
  },
  inspirationText: {
    color: SystemColors.primaryColor1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'left',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  bulbIcon: {
    width: 16,
    height: 16,
  },
  title: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingBottom:16
  },
  categoryWrapper: {
    marginHorizontal: 4,
  },
  categoryButton: {
    borderRadius: 8,
    backgroundColor: '#231E27',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: SystemColors.white_70,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  selectedCategoryButton: {
    borderWidth: 1,
    borderColor: SystemColors.primaryColor1,
  },
  selectedCategoryText: {
    color: SystemColors.white,
  },
  generateButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  generateText: {
    color: SystemColors.white,
  },
  voicesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  voicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceItem: {
    width: '31%',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: 8,
  },
  voiceImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#231E27',
    opacity: 0.3,
    borderRadius: 8,
  },
  voiceName: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  categoriesScrollView: {
    flexGrow: 0,
  },
  selectedVoiceItem: {
    borderWidth: 1,
    borderColor: '#F76CC6',
  },
  voiceSelectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F76CC6',
  },
  voiceSelectedIcon: {
    width: 24,
    height: 24,
    opacity: 1,
  },
}); 