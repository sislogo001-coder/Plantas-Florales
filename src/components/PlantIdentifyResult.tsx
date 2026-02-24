import { X, Droplets, Sun, AlertCircle } from 'lucide-react';
import { Plant } from '../types';

interface PlantIdentifyResultProps {
  plant: Plant | null;
  imageUrl: string;
  onClose: () => void;
}

export function PlantIdentifyResult({ plant, imageUrl, onClose }: PlantIdentifyResultProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-2 border-orange-500 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Planta capturada"
            className="w-full h-64 object-cover rounded-t-xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {plant ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                  95% coincidencia
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">{plant.name}</h2>
              <p className="text-gray-400 italic mb-4">{plant.scientificName}</p>
              
              <p className="text-gray-300 mb-6">{plant.description}</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-500">Cuidados</h3>
                
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Droplets className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Riego</p>
                      <p className="text-white">{plant.waterFrequency}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                    <div className="bg-yellow-500/20 p-2 rounded-lg">
                      <Sun className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Luz</p>
                      <p className="text-white">{plant.sunlight}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      plant.careLevel === 'Fácil' ? 'bg-green-500/20' :
                      plant.careLevel === 'Moderado' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        plant.careLevel === 'Fácil' ? 'text-green-400' :
                        plant.careLevel === 'Moderado' ? 'text-yellow-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Nivel de cuidado</p>
                      <p className="text-white">{plant.careLevel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Planta no identificada</h2>
              <p className="text-gray-400">
                No pudimos identificar esta planta. Intenta tomar otra foto con mejor iluminación y enfocando las hojas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
