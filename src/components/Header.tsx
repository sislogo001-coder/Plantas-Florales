import { Leaf } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: 'home', label: 'Inicio' },
    { id: 'identify', label: 'Identificar' },
    { id: 'recipes', label: 'Composta' },
    { id: 'tips', label: 'Tips' },
  ];

  return (
    <header className="bg-black border-b-2 border-orange-500 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Leaf className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-orange-500">PlantID</h1>
              <p className="text-xs text-gray-400">Identificador de Plantas</p>
            </div>
          </div>
        </div>
        
        <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-black'
                  : 'bg-gray-900 text-gray-300 border border-orange-500/30 hover:border-orange-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
