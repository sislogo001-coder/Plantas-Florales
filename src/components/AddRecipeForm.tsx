import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { CompostRecipe } from '../types';

interface AddRecipeFormProps {
  onClose: () => void;
  onAdd: (recipe: CompostRecipe) => void;
}

export function AddRecipeForm({ onClose, onAdd }: AddRecipeFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState('');
  const [tips, setTips] = useState('');

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipe: CompostRecipe = {
      id: Date.now().toString(),
      title,
      author,
      ingredients: ingredients.filter(i => i.trim() !== ''),
      instructions,
      tips,
      likes: 0,
      date: new Date().toISOString().split('T')[0],
    };
    
    onAdd(recipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-orange-500">Nueva Receta de Composta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-gray-800 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
              placeholder="Ej: Composta de jardín"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tu nombre</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="w-full bg-gray-800 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
              placeholder="Tu nombre"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ingredientes</label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 bg-gray-800 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Ingrediente"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 text-orange-500 text-sm hover:underline"
            >
              <Plus className="w-4 h-4" />
              Agregar ingrediente
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Instrucciones</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              rows={4}
              className="w-full bg-gray-800 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none resize-none"
              placeholder="Describe el paso a paso..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tips adicionales</label>
            <textarea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none resize-none"
              placeholder="Consejos extra para mejores resultados..."
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Publicar Receta
          </button>
        </form>
      </div>
    </div>
  );
}
