export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Voice {
  imageUrl: string;
  category: string;
  order: number;
  name: string;
}

export interface ApiResponse {
  objects: Voice[];
}

export interface GenerateMusicRequest {
  prompt: string;
  voice: string;
  category: string;
}

export interface GenerateMusicResponse {
  resultUrl: string;
} 