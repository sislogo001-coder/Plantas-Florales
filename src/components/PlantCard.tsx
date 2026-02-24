import { Droplets, Sun } from 'lucide-react';
import { Plant } from '../types';

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const careLevelColor = {
    'Fácil': 'text-green-400 bg-green-400/20',
    'Moderado': 'text-yellow-400 bg-yellow-400/20',
    'Difícil': 'text-red-400 bg-red-400/20',
  };

  return (
    <div className="bg-gray-900 border-2 border-orange-500 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-orange-500/20 transition-all">
      <div className="h-48 overflow-hidden">
        <img
          src={plant.image}
          alt={plant.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-white">{plant.name}</h3>
            <p className="text-sm text-gray-400 italic">{plant.scientificName}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${careLevelColor[plant.careLevel]}`}>
            {plant.careLevel}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{plant.description}</p>
        
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1 text-blue-400">
            <Droplets className="w-4 h-4" />
            <span className="text-gray-300">{plant.waterFrequency}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Sun className="w-4 h-4" />
            <span className="text-gray-300">{plant.sunlight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
