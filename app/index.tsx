import React, { useEffect, useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Image,SafeAreaView,Platform,} from 'react-native';
import { router } from 'expo-router';
import { SystemColors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../hooks/useThemeColor';
import { fetchCategories } from '../data/api/music';
import { Category, Voice } from '../data/model/music';
import { INSPIRATION_TEXTS } from '../data/inspiration_data/texts';



export default function MusicGenerator() {
  const { theme, isDark } = useThemeColor();
  const [categories, setCategories] = useState<Category[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sayfa yüklendiğinde kategorileri ve sesleri yükler
   * useEffect ile component mount olduğunda çağrılır
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * API'den kategori ve ses verilerini çeker
   * Başarılı olduğunda state'leri günceller
   */
  const loadData = async () => {
    const { categories, voices } = await fetchCategories();
    setCategories(categories);
    setVoices(voices);
  };

  /**
   * Seçili kategoriye göre sesleri filtreler
   * 'All' seçiliyse tüm sesleri, değilse sadece o kategorideki sesleri gösterir
   */
  const filteredVoices = voices.filter(voice => 
    selectedCategory === 'All' || voice.category === selectedCategory
  );

  /**
   * İlham al butonuna tıklandığında rastgele bir metin seçer
   * Seçilen metni prompt state'ine atar
   */
  const handleInspirationClick = () => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_TEXTS.length);
    setPrompt(INSPIRATION_TEXTS[randomIndex]);
  };

  /**
   * Devam et butonuna tıklandığında generating sayfasına yönlendirir
   */
  const handleContinue = async () => {
    if (!prompt || !selectedVoice || isLoading) return;
    
    try {
      setIsLoading(true);
      const selectedVoiceObject = voices.find(voice => voice.name === selectedVoice);
      if (!selectedVoiceObject) return;

      const encodedImageUrl = encodeURIComponent(selectedVoiceObject.imageUrl);

      router.push({
        pathname: "/generating",
        params: { 
          prompt,
          voice: selectedVoice,
          category: selectedCategory !== 'All' ? selectedCategory : '',
          imageUrl: encodedImageUrl
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: SystemColors.black }]}>
      <Text style={styles.headerText}>AI Voice</Text>
      <View style={[styles.inputContainer]}>
        <TextInput
          style={[styles.input, Typography.bodyRegular, { color: theme.text }]}
          placeholder="Write a text and let AI turn it into a speech with the voice of your favorite character"
          placeholderTextColor={isDark ? SystemColors.white_50 : SystemColors.gray}
          multiline
          value={prompt}
          onChangeText={setPrompt}
        />
        {prompt.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setPrompt('')}
          >
            <Image 
              source={require('../assets/icons/closeIcon.png')}
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.inspirationButton}
          onPress={handleInspirationClick}
        >
          <View style={styles.inspirationContent}>
            <Text style={[styles.inspirationText, Typography.bodyRegular]}>
              Get inspiration
            </Text>
            <Image 
              source={require('../assets/icons/bulbIcon.png')}
              style={styles.bulbIcon}
            />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, Typography.title2, { color: theme.text }]}>
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
              <View style={[
                styles.imageContainer,
                { borderWidth: 1, borderColor: selectedVoice === voice.name ? '#F76CC6' : 'transparent' }
              ]}>
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
        disabled={!prompt || !selectedVoice || isLoading}
        activeOpacity={0.8}
        style={{ opacity: isLoading ? 0.7 : 1 }}
      >
        <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
          colors={(!prompt || !selectedVoice || isLoading) 
            ? ['#4A203B', '#4A203B'] 
            : [...SystemColors.linearGradient]}
          style={styles.generateButton}
        >
          <Text style={[
            styles.generateText, 
            Typography.bodyBold,
            (!prompt || !selectedVoice || isLoading) && { color: SystemColors.white_50 }
          ]}>
            {isLoading ? 'Please wait...' : 'Continue'}
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
    backgroundColor: "#231E27",
    marginBottom: 24,
    position: 'relative',
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
    paddingHorizontal: 17,
    backgroundColor: '#231E27',
    padding: 8,
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
    paddingHorizontal: 10,
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
  clearButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    padding: 8,
    zIndex: 1,
  },
  clearIcon: {
    width: 12,
    height: 12,
    tintColor: SystemColors.white_50,
  },
}); 