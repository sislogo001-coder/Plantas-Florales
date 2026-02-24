import { Camera, Upload } from 'lucide-react';
import { useRef } from 'react';

interface CameraButtonProps {
  onCapture: (file: File) => void;
}

export function CameraButton({ onCapture }: CameraButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="bg-orange-500 hover:bg-orange-600 text-black p-6 rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Camera className="w-12 h-12" />
        </button>
        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black animate-pulse" />
      </div>
      
      <p className="text-gray-400 text-sm">Toca para tomar foto</p>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-black transition-all"
      >
        <Upload className="w-5 h-5" />
        Subir imagen
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
