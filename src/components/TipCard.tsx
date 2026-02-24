import { Heart, User, Droplets, Sun, Mountain, Sparkles, Leaf } from 'lucide-react';
import { PlantingTip } from '../types';
import { useState } from 'react';

interface TipCardProps {
  tip: PlantingTip;
}

const categoryConfig = {
  riego: { icon: Droplets, color: 'text-blue-400 bg-blue-400/20', label: 'Riego' },
  luz: { icon: Sun, color: 'text-yellow-400 bg-yellow-400/20', label: 'Luz' },
  tierra: { icon: Mountain, color: 'text-amber-600 bg-amber-600/20', label: 'Tierra' },
  fertilizante: { icon: Sparkles, color: 'text-green-400 bg-green-400/20', label: 'Fertilizante' },
  general: { icon: Leaf, color: 'text-orange-400 bg-orange-400/20', label: 'General' },
};

export function TipCard({ tip }: TipCardProps) {
  const [likes, setLikes] = useState(tip.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const category = categoryConfig[tip.category];
  const CategoryIcon = category.icon;

  return (
    <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-4 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
          <CategoryIcon className="w-3 h-3" />
          {category.label}
        </span>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
            liked ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likes}</span>
        </button>
      </div>
      
      <p className="text-gray-200 mb-4">{tip.content}</p>
      
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <User className="w-4 h-4" />
        <span>{tip.author}</span>
        <span className="text-gray-600">•</span>
        <span>{new Date(tip.date).toLocaleDateString('es-ES')}</span>
      </div>
    </div>
  );
}
