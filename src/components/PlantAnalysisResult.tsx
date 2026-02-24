import React from 'react'
import { Heart, Droplets, Sun, Leaf, AlertTriangle, CheckCircle, XCircle, Flower2, ThermometerSun, Scissors } from 'lucide-react'

export interface AnalysisResult {
  plantName: string
  scientificName: string
  healthStatus: 'healthy' | 'needs_attention' | 'critical'
  healthScore: number
  diagnosis: string
  issues: string[]
  careTips: string[]
  floweringTips: string[]
  wateringNeeds: string
  lightNeeds: string
  temperature: string
  humidity: string
}

interface PlantAnalysisResultProps {
  result: AnalysisResult
  imageUrl: string
  onClose: () => void
  onNewAnalysis: () => void
}

const PlantAnalysisResult: React.FC<PlantAnalysisResultProps> = ({
  result,
  imageUrl,
  onClose,
  onNewAnalysis
}) => {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'needs_attention': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 border-green-500'
      case 'needs_attention': return 'bg-yellow-500/20 border-yellow-500'
      case 'critical': return 'bg-red-500/20 border-red-500'
      default: return 'bg-gray-500/20 border-gray-500'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-8 h-8 text-green-400" />
      case 'needs_attention': return <AlertTriangle className="w-8 h-8 text-yellow-400" />
      case 'critical': return <XCircle className="w-8 h-8 text-red-400" />
      default: return <Heart className="w-8 h-8 text-gray-400" />
    }
  }

  const getHealthText = (status: string) => {
    switch (status) {
      case 'healthy': return '¡Excelente! Tu planta está sana'
      case 'needs_attention': return 'Necesita atención'
      case 'critical': return 'Estado crítico - Actúa ahora'
      default: return 'Estado desconocido'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 pb-20">
        {/* Header con imagen */}
        <div className="relative mb-6">
          <img
            src={imageUrl}
            alt={result.plantName}
            className="w-full h-64 object-cover rounded-3xl border-2 border-orange-500/50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl font-bold text-white">{result.plantName}</h1>
            <p className="text-orange-400 italic">{result.scientificName}</p>
          </div>
        </div>

        {/* Estado de salud */}
        <div className={`p-6 rounded-2xl border-2 mb-6 ${getHealthBg(result.healthStatus)}`}>
          <div className="flex items-center gap-4 mb-4">
            {getHealthIcon(result.healthStatus)}
            <div>
              <h2 className={`text-xl font-bold ${getHealthColor(result.healthStatus)}`}>
                {getHealthText(result.healthStatus)}
              </h2>
              <p className="text-gray-400">Puntuación de salud: {result.healthScore}/100</p>
            </div>
          </div>
          
          {/* Barra de salud */}
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                result.healthScore >= 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                result.healthScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${result.healthScore}%` }}
            />
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Diagnóstico
          </h3>
          <p className="text-gray-300 leading-relaxed">{result.diagnosis}</p>
          
          {result.issues.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-red-400 mb-2">Problemas detectados:</h4>
              <ul className="space-y-2">
                {result.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-400">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Necesidades básicas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4">
            <Droplets className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="text-sm font-semibold text-blue-400">Riego</h4>
            <p className="text-gray-300 text-sm mt-1">{result.wateringNeeds}</p>
          </div>
          <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4">
            <Sun className="w-8 h-8 text-yellow-400 mb-2" />
            <h4 className="text-sm font-semibold text-yellow-400">Luz</h4>
            <p className="text-gray-300 text-sm mt-1">{result.lightNeeds}</p>
          </div>
          <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
            <ThermometerSun className="w-8 h-8 text-orange-400 mb-2" />
            <h4 className="text-sm font-semibold text-orange-400">Temperatura</h4>
            <p className="text-gray-300 text-sm mt-1">{result.temperature}</p>
          </div>
          <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-4">
            <Droplets className="w-8 h-8 text-cyan-400 mb-2" />
            <h4 className="text-sm font-semibold text-cyan-400">Humedad</h4>
            <p className="text-gray-300 text-sm mt-1">{result.humidity}</p>
          </div>
        </div>

        {/* Tips de cuidado */}
        <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Consejos de Cuidado
          </h3>
          <ul className="space-y-3">
            {result.careTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips para floración */}
        <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
            <Flower2 className="w-5 h-5" />
            Para que Florezca
          </h3>
          <ul className="space-y-3">
            {result.floweringTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <Flower2 className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            Nuevo Análisis
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlantAnalysisResult
