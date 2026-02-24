import { useState } from 'react';
import { X } from 'lucide-react';
import { PlantingTip } from '../types';

interface AddTipFormProps {
  onClose: () => void;
  onAdd: (tip: PlantingTip) => void;
}

export function AddTipForm({ onClose, onAdd }: AddTipFormProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PlantingTip['category']>('general');

  const categories = [
    { value: 'riego', label: '💧 Riego' },
    { value: 'luz', label: '☀️ Luz' },
    { value: 'tierra', label: '🏔️ Tierra' },
    { value: 'fertilizante', label: '✨ Fertilizante' },
    { value: 'general', label: '🌿 General' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tip: PlantingTip = {
      id: Date.now().toString(),
      author,
      content,
      category,
      likes: 0,
      date: new Date().toISOString().split('T')[0],
    };
    
    onAdd(tip);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-orange-500">Compartir Tip</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value as PlantingTip['category'])}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    category === cat.value
                      ? 'bg-orange-500 text-black font-medium'
                      : 'bg-gray-800 text-gray-300 border border-orange-500/30 hover:border-orange-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tu tip</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={280}
              className="w-full bg-gray-800 border border-orange-500/30 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none resize-none"
              placeholder="Comparte tu mejor consejo de jardinería..."
            />
            <p className="text-right text-sm text-gray-500 mt-1">{content.length}/280</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Publicar Tip
          </button>
        </form>
      </div>
    </div>
  );
}
