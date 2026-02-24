import { Plant, CompostRecipe, PlantingTip } from '../types';

export const samplePlants: Plant[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    description: 'Planta tropical conocida por sus hojas grandes y perforadas. Perfecta para interiores con luz indirecta.',
    careLevel: 'Fácil',
    waterFrequency: 'Cada 1-2 semanas',
    sunlight: 'Luz indirecta brillante',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400'
  },
  {
    id: '2',
    name: 'Pothos Dorado',
    scientificName: 'Epipremnum aureum',
    description: 'Planta colgante muy resistente, ideal para principiantes. Purifica el aire del hogar.',
    careLevel: 'Fácil',
    waterFrequency: 'Cada 1-2 semanas',
    sunlight: 'Luz baja a brillante indirecta',
    image: 'https://images.unsplash.com/photo-1602923668104-8f9e03e77e62?w=400'
  },
  {
    id: '3',
    name: 'Ficus Lyrata',
    scientificName: 'Ficus lyrata',
    description: 'Árbol de interior con hojas grandes en forma de violín. Requiere cuidados moderados.',
    careLevel: 'Moderado',
    waterFrequency: 'Cada 1-2 semanas',
    sunlight: 'Luz brillante indirecta',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400'
  },
  {
    id: '4',
    name: 'Suculenta Echeveria',
    scientificName: 'Echeveria elegans',
    description: 'Suculenta compacta con rosetas perfectas. Muy resistente a la sequía.',
    careLevel: 'Fácil',
    waterFrequency: 'Cada 2-3 semanas',
    sunlight: 'Luz solar directa',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400'
  }
];

export const sampleRecipes: CompostRecipe[] = [
  {
    id: '1',
    title: 'Composta Básica de Cocina',
    author: 'María García',
    ingredients: [
      'Restos de frutas y verduras',
      'Cáscaras de huevo trituradas',
      'Borra de café',
      'Hojas secas',
      'Cartón sin tinta'
    ],
    instructions: '1. Alterna capas de materiales verdes (húmedos) y marrones (secos). 2. Mantén húmedo pero no empapado. 3. Voltea cada semana. 4. En 2-3 meses tendrás composta lista.',
    tips: 'Evita carnes, lácteos y aceites. El tamaño ideal de los trozos es de 2-3 cm.',
    likes: 45,
    date: '2024-01-15'
  },
  {
    id: '2',
    title: 'Composta Express con Lombrices',
    author: 'Carlos Rodríguez',
    ingredients: [
      'Lombrices rojas californianas',
      'Restos vegetales',
      'Papel periódico húmedo',
      'Tierra de jardín',
      'Cáscaras de plátano'
    ],
    instructions: '1. Prepara un contenedor con agujeros. 2. Coloca papel húmedo como base. 3. Añade tierra y lombrices. 4. Alimenta con restos vegetales. 5. Cosecha el humus cada mes.',
    tips: 'Las lombrices no toleran cítricos ni cebollas. Mantén el ambiente oscuro y fresco.',
    likes: 78,
    date: '2024-02-20'
  },
  {
    id: '3',
    title: 'Té de Composta Nutritivo',
    author: 'Ana Martínez',
    ingredients: [
      '1 taza de composta madura',
      '5 litros de agua sin cloro',
      '1 cucharada de melaza',
      'Bolsa de tela permeable'
    ],
    instructions: '1. Coloca la composta en la bolsa de tela. 2. Sumerge en el agua. 3. Añade melaza. 4. Deja reposar 24-48 horas removiendo ocasionalmente. 5. Diluye 1:10 para regar.',
    tips: 'Usa inmediatamente para máximos beneficios. Ideal para foliar en la mañana.',
    likes: 62,
    date: '2024-03-10'
  }
];

export const sampleTips: PlantingTip[] = [
  {
    id: '1',
    author: 'Pedro Sánchez',
    content: 'Para saber si tu planta necesita agua, introduce un palillo en la tierra. Si sale limpio, es hora de regar.',
    category: 'riego',
    likes: 89,
    date: '2024-01-20'
  },
  {
    id: '2',
    author: 'Laura López',
    content: 'Rota tus plantas 1/4 de vuelta cada semana para que crezcan de manera uniforme hacia la luz.',
    category: 'luz',
    likes: 56,
    date: '2024-02-15'
  },
  {
    id: '3',
    author: 'Miguel Torres',
    content: 'Añade perlita a tu sustrato para mejorar el drenaje y evitar el encharcamiento de raíces.',
    category: 'tierra',
    likes: 72,
    date: '2024-02-28'
  },
  {
    id: '4',
    author: 'Carmen Ruiz',
    content: 'El agua de cocción de verduras (sin sal) es excelente como fertilizante natural cuando se enfría.',
    category: 'fertilizante',
    likes: 94,
    date: '2024-03-05'
  },
  {
    id: '5',
    author: 'Roberto Díaz',
    content: 'Limpia las hojas de tus plantas con un paño húmedo cada 2 semanas para mejorar la fotosíntesis.',
    category: 'general',
    likes: 67,
    date: '2024-03-12'
  }
];
