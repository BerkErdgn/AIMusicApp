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