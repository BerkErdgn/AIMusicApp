import { Category, Voice, ApiResponse, GenerateMusicRequest, GenerateMusicResponse } from '../model/musicModel';

/**
 * API function to fetch music categories and voices
 * 
 * - categories: Array containing all categories (including 'All')
 * - voices: Sorted list of voices
 * 
 * Functions:
 * 1. Sends POST request to API
 * 2. Extracts unique categories from response
 * 3. Adds 'All' category
 * 4. Sorts voices by order
 * 5. Returns default values in case of error
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
 * Calls the music generation API
 * 
 * Functions:
 * 1. Sends prompt, voice and category data to API
 * 2. Returns URL of generated music
 * 3. Throws error if request fails
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