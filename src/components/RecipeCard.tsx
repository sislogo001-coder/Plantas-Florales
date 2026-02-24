import { Heart, User, Calendar, Lightbulb } from 'lucide-react';
import { CompostRecipe } from '../types';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: CompostRecipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [likes, setLikes] = useState(recipe.likes);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-4 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-orange-400">{recipe.title}</h3>
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
      
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{recipe.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(recipe.date).toLocaleDateString('es-ES')}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-2">Ingredientes:</h4>
        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      
      {expanded && (
        <>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">Instrucciones:</h4>
            <p className="text-gray-300 text-sm">{recipe.instructions}</p>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-semibold text-sm">Tip del autor</span>
            </div>
            <p className="text-gray-300 text-sm">{recipe.tips}</p>
          </div>
        </>
      )}
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 text-orange-500 text-sm font-medium hover:underline"
      >
        {expanded ? 'Ver menos' : 'Ver más'}
      </button>
    </div>
  );
}
