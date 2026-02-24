export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  careLevel: 'Fácil' | 'Moderado' | 'Difícil';
  waterFrequency: string;
  sunlight: string;
  image: string;
}

export interface CompostRecipe {
  id: string;
  title: string;
  author: string;
  ingredients: string[];
  instructions: string;
  tips: string;
  likes: number;
  date: string;
}

export interface PlantingTip {
  id: string;
  author: string;
  content: string;
  category: 'riego' | 'luz' | 'tierra' | 'fertilizante' | 'general';
  likes: number;
  date: string;
}
