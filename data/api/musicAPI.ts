import { Category, Voice, ApiResponse, GenerateMusicRequest, GenerateMusicResponse } from '../model/musicModel';

/**
 * Müzik kategorilerini ve sesleri getiren API fonksiyonu
 * 
 * - categories: Tüm kategorileri içeren dizi ('All' kategorisi dahil)
 * - voices: Sıralanmış ses listesi
 * 
 * İşlevler:
 * 1. API'ye POST isteği gönderir
 * 2. Gelen verideki benzersiz kategorileri çıkarır
 * 3. 'All' kategorisini ekler
 * 4. Sesleri order'a göre sıralar
 * 5. Hata durumunda varsayılan değerler döndürür
 * 
 */
export const fetchCategories = async (): Promise<{ categories: Category[], voices: Voice[] }> => {
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

    const sortedVoices = data.objects.sort((a, b) => a.order - b.order);

    return {
      categories: categoryObjects,
      voices: sortedVoices
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      categories: [{ id: 'all', name: 'All', image: '' }],
      voices: []
    };
  }
};

/**
 * Müzik oluşturma API'sini çağırır
 * 
 * İşlevler:
 * 1. API'ye prompt, voice ve category bilgilerini gönderir
 * 2. Oluşturulan müziğin URL'ini döndürür
 * 3. Hata durumunda error fırlatır
 */
export const generateMusic = async (params: GenerateMusicRequest): Promise<GenerateMusicResponse> => {
  const response = await fetch('https://us-central1-ai-video-40ecf.cloudfunctions.net/startMusicGenerate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse response:', text);
    throw new Error('Invalid response format');
  }
}; 