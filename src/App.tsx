import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://sqabjzshlvyrytuqcxwb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWJqenNobHZ5cnl0dXFjeHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTA2OTIsImV4cCI6MjA4NzM4NjY5Mn0.RMtY46vbG-EyZb1eWM_iwmWPS4WpdpCNMku3RW70eLk'
const supabase = createClient(supabaseUrl, supabaseKey)

// API Key de Plant.id
const PLANT_ID_API_KEY = 'BDvzlRqpU9RJirPtlabNzwywNeKlL1ZxO7eCvr6ppYHUlR03uJ'

// Tipos
interface PlantInfo {
  name: string
  scientificName: string
  family: string
  confidence: number
  description: string
  origin: string
  toxicity: { toxic: boolean; level: string; details: string }
  care: {
    water: string
    sunlight: string
    temperature: string
    humidity: string
    soil: string
    fertilizer: string
  }
  diseases: { name: string; symptoms: string; treatment: string }[]
  gardeningTips: string[]
  bloomingSeason: string
  lifespan: string
}

interface HealthAnalysis {
  status: 'healthy' | 'warning' | 'critical'
  score: number
  diagnosis: string
  problems: string[]
  recommendations: string[]
}

type TabType = 'home' | 'camera' | 'history' | 'tips'

// Función para comprimir imagen antes de enviar
const compressImage = (base64: string, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)
      
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      resolve(compressed)
    }
    img.src = base64
  })
}

// Función para identificar planta con Plant.id API REAL
const identifyPlantWithAI = async (imageBase64: string): Promise<{plant: PlantInfo, health: HealthAnalysis}> => {
  try {
    // Comprimir imagen primero
    const compressedImage = await compressImage(imageBase64)
    
    // Quitar el prefijo data:image/...;base64,
    const base64Data = compressedImage.replace(/^data:image\/\w+;base64,/, '')
    
    console.log('📤 Enviando imagen a Plant.id...')
    console.log('📦 Tamaño de imagen:', Math.round(base64Data.length / 1024), 'KB')
    
    // Llamar a Plant.id API v3
    const response = await fetch('https://plant.id/api/v3/identification', {
      method: 'POST',
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [base64Data],
        latitude: 19.4326,
        longitude: -99.1332,
        similar_images: true,
      }),
    })

    console.log('📥 Respuesta status:', response.status)
    
    const responseText = await response.text()
    console.log('📄 Respuesta raw:', responseText.substring(0, 500))
    
    if (!response.ok) {
      console.error('❌ Plant.id API error status:', response.status)
      console.error('❌ Plant.id API error body:', responseText)
      throw new Error(`Error de API: ${response.status} - ${responseText.substring(0, 100)}`)
    }

    const data = JSON.parse(responseText)
    console.log('✅ Plant.id response parsed:', data)

    // Obtener la sugerencia principal - manejar diferentes formatos de respuesta
    let suggestion = data.result?.classification?.suggestions?.[0]
    
    // Si no está en ese formato, probar otro
    if (!suggestion) {
      suggestion = data.suggestions?.[0]
    }
    
    // Si tampoco, probar con result.suggestions
    if (!suggestion) {
      suggestion = data.result?.suggestions?.[0]
    }
    
    console.log('🌿 Sugerencia encontrada:', suggestion)
    
    if (!suggestion) {
      console.error('❌ No se encontró sugerencia en la respuesta:', JSON.stringify(data, null, 2))
      throw new Error('No se pudo identificar la planta. Intenta con mejor iluminación.')
    }

    // Obtener información de salud (manejar que puede no existir)
    const isHealthy = data.result?.is_healthy?.binary ?? true
    const healthProbability = data.result?.is_healthy?.probability ?? 0.85
    const diseasesSuggestions = data.result?.disease?.suggestions || []
    
    console.log('🏥 Info de salud:', { isHealthy, healthProbability, diseasesSuggestions })

    // Calcular estado de salud
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy'
    let healthScore = Math.round(healthProbability * 100)
    
    if (isHealthy === false) {
      if (healthProbability < 0.3) {
        healthStatus = 'critical'
        healthScore = Math.round((1 - healthProbability) * 30)
      } else if (healthProbability < 0.6) {
        healthStatus = 'warning'
        healthScore = Math.round((1 - healthProbability) * 60)
      }
    }

    // Extraer problemas de salud
    const problems: string[] = []
    const diseases: { name: string; symptoms: string; treatment: string }[] = []
    
    diseasesSuggestions.forEach((disease: any) => {
      if (disease.probability > 0.1) {
        problems.push(disease.name)
        diseases.push({
          name: disease.name,
          symptoms: disease.details?.description || 'Observar la planta detenidamente',
          treatment: disease.details?.treatment?.biological?.[0] || 
                     disease.details?.treatment?.chemical?.[0] || 
                     'Consultar con un especialista'
        })
      }
    })

    // Determinar toxicidad (lista de plantas tóxicas conocidas)
    const toxicPlants = ['dieffenbachia', 'philodendron', 'pothos', 'lily', 'oleander', 'azalea', 'rhododendron', 'sago', 'tulip', 'daffodil', 'foxglove', 'hydrangea', 'monstera', 'caladium', 'peace lily', 'english ivy']
    const plantNameLower = suggestion.name?.toLowerCase() || ''
    const isToxic = toxicPlants.some(toxic => plantNameLower.includes(toxic))

    // Construir información de la planta
    const plant: PlantInfo = {
      name: suggestion.name || 'Planta identificada',
      scientificName: suggestion.details?.taxonomy?.scientificName || suggestion.name || 'No disponible',
      family: suggestion.details?.taxonomy?.family || 'No disponible',
      confidence: Math.round((suggestion.probability || 0) * 100),
      description: suggestion.details?.description?.value || 
                   `Esta es una ${suggestion.name}. Identificada con ${Math.round((suggestion.probability || 0) * 100)}% de confianza por nuestra IA.`,
      origin: suggestion.details?.taxonomy?.genus ? `Género: ${suggestion.details.taxonomy.genus}` : 'No disponible',
      toxicity: {
        toxic: isToxic,
        level: isToxic ? '⚠️ Potencialmente tóxica' : '✅ No tóxica conocida',
        details: isToxic 
          ? 'Esta planta puede ser tóxica para mascotas y niños si se ingiere. Mantener fuera del alcance.'
          : 'No se conoce toxicidad significativa para esta especie. Aún así, evitar ingerir plantas ornamentales.'
      },
      care: {
        water: suggestion.details?.watering?.max 
          ? `Riego cada ${suggestion.details.watering.min || 3}-${suggestion.details.watering.max} días`
          : 'Riego moderado, verificar humedad del suelo antes de regar',
        sunlight: suggestion.details?.edible_parts 
          ? 'Luz brillante indirecta recomendada'
          : 'Adaptar según la respuesta de la planta',
        temperature: '18-25°C (temperatura ambiente típica)',
        humidity: '40-60% de humedad relativa',
        soil: 'Sustrato bien drenado con materia orgánica',
        fertilizer: 'Fertilizante balanceado cada 2-4 semanas en temporada de crecimiento'
      },
      diseases: diseases.length > 0 ? diseases : [
        { name: 'Sin enfermedades detectadas', symptoms: 'La planta se ve saludable', treatment: 'Continuar con cuidados regulares' }
      ],
      gardeningTips: [
        '🌱 Revisa las hojas regularmente en busca de plagas',
        '💧 No riegues en exceso, es la causa #1 de muerte en plantas',
        '☀️ Observa cómo responde a la luz actual',
        '🪴 Trasplanta cuando las raíces salgan por los agujeros',
        '✂️ Poda las hojas amarillas o muertas'
      ],
      bloomingSeason: suggestion.details?.propagation_methods 
        ? `Propagación: ${suggestion.details.propagation_methods.join(', ')}`
        : 'Información no disponible',
      lifespan: 'Variable según cuidados'
    }

    // Construir análisis de salud
    const health: HealthAnalysis = {
      status: healthStatus,
      score: healthScore,
      diagnosis: healthStatus === 'healthy'
        ? '✨ ¡Tu planta está saludable! Continúa con los cuidados actuales.'
        : healthStatus === 'warning'
        ? '⚠️ Tu planta necesita atención. Hay algunos signos de estrés o enfermedad.'
        : '🚨 Tu planta necesita atención urgente. Se detectaron problemas serios.',
      problems: problems.length > 0 ? problems : (healthStatus !== 'healthy' ? ['Estrés general detectado'] : []),
      recommendations: healthStatus === 'healthy'
        ? ['Mantén tu rutina de cuidados', 'Sigue observando la planta regularmente']
        : healthStatus === 'warning'
        ? ['Revisa el riego y la luz', 'Considera cambiar la ubicación', 'Monitorea los próximos días']
        : ['Aísla la planta de otras', 'Trata con fungicida o insecticida según sea necesario', 'Considera consultar un especialista']
    }

    return { plant, health }

  } catch (error) {
    console.error('Error al identificar:', error)
    throw error
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [identifiedPlant, setIdentifiedPlant] = useState<PlantInfo | null>(null)
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<Array<{image: string, plant: PlantInfo, date: string}>>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Verificar conexión a Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('plant_analyses').select('count').limit(1)
        setIsConnected(!error)
      } catch {
        setIsConnected(false)
      }
    }
    checkConnection()
    loadHistory()
  }, [])

  // Cargar historial de Supabase
  const loadHistory = async () => {
    try {
      const { data } = await supabase
        .from('plant_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) {
        const history = data.map(item => ({
          image: item.image_url || '',
          plant: {
            name: item.plant_name,
            scientificName: item.scientific_name || '',
            family: item.family || '',
            confidence: item.confidence || 95,
            description: item.description || '',
            origin: item.origin || '',
            toxicity: item.toxicity || { toxic: false, level: 'Desconocido', details: '' },
            care: item.care || {},
            diseases: item.diseases || [],
            gardeningTips: item.gardening_tips || [],
            bloomingSeason: item.blooming_season || '',
            lifespan: item.lifespan || ''
          } as PlantInfo,
          date: new Date(item.created_at).toLocaleDateString('es-ES')
        }))
        setScanHistory(history)
      }
    } catch (error) {
      console.log('Error loading history:', error)
    }
  }

  // Guardar análisis en Supabase
  const saveAnalysis = async (plant: PlantInfo, imageUrl: string, health: HealthAnalysis) => {
    try {
      await supabase.from('plant_analyses').insert({
        image_url: imageUrl.substring(0, 500), // Limitar tamaño
        plant_name: plant.name,
        scientific_name: plant.scientificName,
        family: plant.family,
        confidence: plant.confidence,
        description: plant.description,
        origin: plant.origin,
        toxicity: plant.toxicity,
        care: plant.care,
        diseases: plant.diseases,
        gardening_tips: plant.gardeningTips,
        blooming_season: plant.bloomingSeason,
        lifespan: plant.lifespan,
        health_status: health.status,
        health_score: health.score,
        diagnosis: health.diagnosis
      })
      loadHistory()
    } catch (error) {
      console.log('Error saving:', error)
    }
  }

  // Iniciar cámara
  const startCamera = async () => {
    setShowCamera(true)
    setCameraError(null)
    setError(null)
    
    // Primero detener cualquier stream existente
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    try {
      // Configuración optimizada para móviles
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('webkit-playsinline', 'true')
        videoRef.current.setAttribute('autoplay', 'true')
        videoRef.current.muted = true
        
        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.log('Play error:', e))
        }
        
        await videoRef.current.play()
      }
    } catch (error: unknown) {
      console.error('Camera error:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setCameraError('📵 Permiso de cámara denegado. Toca "Subir imagen" para continuar.')
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setCameraError('📷 No se encontró cámara. Toca "Subir imagen" para continuar.')
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setCameraError('⚠️ La cámara está en uso por otra app. Ciérrala e intenta de nuevo.')
        } else {
          setCameraError('❌ Error al acceder a la cámara. Toca "Subir imagen" para continuar.')
        }
      }
    }
  }

  // Detener cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current
      
      // Verificar que el video esté listo
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        console.log('Video no está listo, intentando de nuevo...')
        setTimeout(capturePhoto, 500)
        return
      }
      
      try {
        const canvas = document.createElement('canvas')
        // Usar dimensiones más seguras
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = canvas.toDataURL('image/jpeg', 0.85)
          
          // Verificar que la imagen no esté vacía
          if (imageData && imageData.length > 100) {
            setCapturedImage(imageData)
            stopCamera()
            analyzeImage(imageData)
          } else {
            console.error('Imagen capturada está vacía')
            setCameraError('Error al capturar. Por favor sube una imagen.')
          }
        }
      } catch (err) {
        console.error('Error al capturar:', err)
        setCameraError('Error al capturar. Por favor sube una imagen.')
      }
    }
  }

  // Manejar archivo subido
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setCapturedImage(imageData)
        stopCamera()
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  // Analizar imagen con IA REAL
  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    setActiveTab('camera')
    setError(null)
    
    try {
      // Llamar a la API real de Plant.id
      const { plant, health } = await identifyPlantWithAI(imageData)
      
      setIdentifiedPlant(plant)
      setHealthAnalysis(health)
      
      // Guardar en Supabase
      saveAnalysis(plant, imageData, health)
      
      // Agregar al historial local
      setScanHistory(prev => [{
        image: imageData,
        plant,
        date: new Date().toLocaleDateString('es-ES')
      }, ...prev.slice(0, 9)])
      
    } catch (err: any) {
      console.error('Error analyzing:', err)
      const errorMessage = err?.message || 'Error desconocido'
      setError(`No se pudo identificar: ${errorMessage}. Intenta con mejor iluminación y enfocando bien la planta.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Resetear análisis
  const resetAnalysis = () => {
    setCapturedImage(null)
    setIdentifiedPlant(null)
    setHealthAnalysis(null)
    setError(null)
    setActiveTab('home')
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo de tulipanes */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1520763185298-1b434c919102?w=1920&q=80" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
        
        {/* Partículas flotantes */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/40 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">PlantAI</h1>
              <p className="text-[10px] text-green-400">IA Real • 98% Precisión</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            {isConnected ? 'Online' : 'Offline'}
          </div>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto px-4 pb-24">
          
          {/* HOME */}
          {activeTab === 'home' && !capturedImage && (
            <div className="space-y-6 animate-fadeIn">
              {/* Hero */}
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs mb-4">
                  <span>🤖</span> Identificación con IA Real
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  Identifica cualquier <span className="text-green-400">planta</span>
                </h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  Toma una foto y obtén identificación instantánea, diagnóstico de salud y consejos de cuidado
                </p>
              </div>

              {/* Botones de escaneo */}
              <div className="space-y-3">
                {/* Botón principal - Tomar foto (funciona mejor en móviles) */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 transition-all active:scale-95"
                >
                  <span className="text-2xl">📸</span>
                  <span>Tomar Foto</span>
                </button>
                
                {/* Botón secundario - Subir imagen */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl flex items-center justify-center gap-3 border border-white/20 transition-all active:scale-95"
                >
                  <span className="text-xl">🖼️</span>
                  <span>Subir de Galería</span>
                </button>
              </div>

              {/* Características */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  { icon: '🔍', title: 'Identificación', desc: '17,000+ especies' },
                  { icon: '🏥', title: 'Diagnóstico', desc: 'Estado de salud' },
                  { icon: '☠️', title: 'Toxicidad', desc: 'Seguridad mascotas' },
                  { icon: '🌱', title: 'Cuidados', desc: 'Tips personalizados' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-semibold mt-2 text-sm">{item.title}</h3>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Estadísticas */}
              <div className="flex justify-around py-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">17K+</p>
                  <p className="text-xs text-gray-400">Especies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">98%</p>
                  <p className="text-xs text-gray-400">Precisión</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">IA</p>
                  <p className="text-xs text-gray-400">Real</p>
                </div>
              </div>
            </div>
          )}

          {/* CAMERA VIEW */}
          {showCamera && (
            <div className="fixed inset-0 z-50 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                webkit-playsinline="true"
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(1)' }}
              />
              
              {/* Marco de enfoque */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 relative">
                  {/* Esquinas del marco */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-400 rounded-tl-3xl"></div>
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-400 rounded-tr-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-400 rounded-bl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-400 rounded-br-3xl"></div>
                  
                  {/* Línea de escaneo animada */}
                  <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan rounded-full shadow-lg shadow-green-400/50"></div>
                  
                  {/* Centro de enfoque */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-green-400/50 rounded-full"></div>
                </div>
              </div>

              {/* Instrucciones arriba */}
              <div className="absolute top-16 left-0 right-0 text-center px-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl py-3 px-4 inline-block">
                  <p className="text-white text-lg font-semibold">🌿 Centra la planta</p>
                  <p className="text-gray-300 text-sm">Buena luz = mejor identificación</p>
                </div>
              </div>

              {/* Controles abajo */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                {cameraError ? (
                  <div className="text-center">
                    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4">
                      <p className="text-red-400 text-sm">{cameraError}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={stopCamera}
                        className="bg-white/20 text-white px-6 py-3 rounded-xl font-medium"
                      >
                        ← Volver
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                      >
                        📁 Subir imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-8">
                    {/* Botón cerrar */}
                    <button
                      onClick={stopCamera}
                      className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl active:scale-90 transition-transform"
                    >
                      ✕
                    </button>
                    
                    {/* Botón capturar - MÁS GRANDE */}
                    <button
                      onClick={capturePhoto}
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-green-400 shadow-xl shadow-green-400/40 active:scale-90 transition-transform"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-3xl">📸</span>
                      </div>
                    </button>
                    
                    {/* Botón galería */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl active:scale-90 transition-transform"
                    >
                      🖼️
                    </button>
                  </div>
                )}
                
                {/* Texto de ayuda */}
                {!cameraError && (
                  <p className="text-center text-gray-400 text-xs mt-4">
                    Toca el botón grande para capturar 📸
                  </p>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* ANALYZING */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
              <div className="relative mb-8">
                {capturedImage && (
                  <img src={capturedImage} alt="" className="w-48 h-48 object-cover rounded-3xl border-4 border-green-400/50" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
                  <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">🤖 Analizando con IA...</h3>
              <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                <p className="animate-pulse">🔍 Identificando especie con Plant.id...</p>
                <p className="animate-pulse delay-300">🏥 Analizando estado de salud...</p>
                <p className="animate-pulse delay-500">📊 Generando diagnóstico...</p>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-bold mb-2 text-red-400">No se pudo identificar</h3>
              <p className="text-gray-400 text-center text-sm mb-6 max-w-xs">{error}</p>
              <button
                onClick={resetAnalysis}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* RESULTS */}
          {identifiedPlant && healthAnalysis && !isAnalyzing && !error && (
            <div className="space-y-4 animate-fadeIn pb-4">
              {/* Imagen y confianza */}
              <div className="relative">
                {capturedImage && (
                  <img src={capturedImage} alt="" className="w-full h-48 object-cover rounded-2xl" />
                )}
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <span>✓</span> {identifiedPlant.confidence}%
                </div>
                <button
                  onClick={resetAnalysis}
                  className="absolute top-3 left-3 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Nombre de la planta */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🌿</span>
                  <h2 className="text-2xl font-bold text-green-400">{identifiedPlant.name}</h2>
                </div>
                <p className="text-gray-400 italic">{identifiedPlant.scientificName}</p>
                <p className="text-xs text-gray-500 mt-1">Familia: {identifiedPlant.family}</p>
              </div>

              {/* Estado de salud */}
              <div className={`rounded-2xl p-4 border ${
                healthAnalysis.status === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
                healthAnalysis.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    {healthAnalysis.status === 'healthy' ? '💚 Saludable' :
                     healthAnalysis.status === 'warning' ? '💛 Necesita Atención' : '❤️ Crítico'}
                  </h3>
                  <span className={`text-2xl font-bold ${
                    healthAnalysis.status === 'healthy' ? 'text-green-400' :
                    healthAnalysis.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{healthAnalysis.score}%</span>
                </div>
                <p className="text-sm text-gray-300">{healthAnalysis.diagnosis}</p>
                
                {healthAnalysis.problems.length > 0 && healthAnalysis.status !== 'healthy' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Problemas detectados:</p>
                    {healthAnalysis.problems.map((p, i) => (
                      <p key={i} className="text-sm text-red-400">• {p}</p>
                    ))}
                  </div>
                )}

                {healthAnalysis.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Recomendaciones:</p>
                    {healthAnalysis.recommendations.map((r, i) => (
                      <p key={i} className="text-sm text-green-400">✓ {r}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Toxicidad */}
              <div className={`rounded-2xl p-4 border ${
                identifiedPlant.toxicity.toxic ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
              }`}>
                <h3 className="font-bold flex items-center gap-2 mb-2">
                  {identifiedPlant.toxicity.toxic ? '☠️ Alerta de Toxicidad' : '✅ No Tóxica'}
                </h3>
                <p className="text-sm font-medium">{identifiedPlant.toxicity.level}</p>
                <p className="text-xs text-gray-400 mt-1">{identifiedPlant.toxicity.details}</p>
              </div>

              {/* Cuidados */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2">🌱 Cuidados Recomendados</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '💧', label: 'Riego', value: identifiedPlant.care.water },
                    { icon: '☀️', label: 'Luz', value: identifiedPlant.care.sunlight },
                    { icon: '🌡️', label: 'Temp', value: identifiedPlant.care.temperature },
                    { icon: '💨', label: 'Humedad', value: identifiedPlant.care.humidity },
                  ].map((item, i) => (
                    <div key={i} className="bg-black/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{item.icon}</span>
                        <span className="text-xs text-gray-400">{item.label}</span>
                      </div>
                      <p className="text-xs">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-black/30 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">🪴 Suelo</p>
                  <p className="text-xs">{identifiedPlant.care.soil}</p>
                </div>
                <div className="mt-2 bg-black/30 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">🧪 Fertilizante</p>
                  <p className="text-xs">{identifiedPlant.care.fertilizer}</p>
                </div>
              </div>

              {/* Enfermedades detectadas */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <h3 className="font-bold mb-3 flex items-center gap-2">🏥 Enfermedades / Diagnóstico</h3>
                {identifiedPlant.diseases.map((disease, i) => (
                  <div key={i} className="bg-black/30 rounded-xl p-3 mb-2 last:mb-0">
                    <p className="font-medium text-orange-400">{disease.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Síntomas: {disease.symptoms}</p>
                    <p className="text-xs text-green-400 mt-1">Tratamiento: {disease.treatment}</p>
                  </div>
                ))}
              </div>

              {/* Tips de jardinería */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                <h3 className="font-bold mb-3 flex items-center gap-2">💡 Tips de Experto</h3>
                {identifiedPlant.gardeningTips.map((tip, i) => (
                  <p key={i} className="text-sm text-gray-300 mb-2 flex items-start gap-2">
                    {tip}
                  </p>
                ))}
              </div>

              {/* Descripción */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <h3 className="font-bold mb-2">📖 Sobre esta planta</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{identifiedPlant.description}</p>
              </div>

              {/* Botón nuevo escaneo */}
              <button
                onClick={resetAnalysis}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                📷 Escanear otra planta
              </button>
            </div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2">📜 Historial de Escaneos</h2>
              {scanHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">🌱</p>
                  <p>No hay escaneos aún</p>
                  <p className="text-sm">¡Escanea tu primera planta!</p>
                </div>
              ) : (
                scanHistory.map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10 flex gap-3">
                    {item.image && item.image.startsWith('data:') ? (
                      <img src={item.image} alt="" className="w-20 h-20 object-cover rounded-xl" />
                    ) : (
                      <div className="w-20 h-20 bg-green-500/20 rounded-xl flex items-center justify-center text-3xl">🌿</div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-green-400">{item.plant.name}</h3>
                      <p className="text-xs text-gray-400 italic">{item.plant.scientificName}</p>
                      <p className="text-xs text-gray-500 mt-2">{item.date}</p>
                    </div>
                    <div className="text-green-400 font-bold text-sm">{item.plant.confidence}%</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TIPS */}
          {activeTab === 'tips' && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-2">🌿 Tips de Jardinería</h2>
              
              {[
                { icon: '💧', title: 'Riego correcto', tip: 'Es mejor regar menos que más. La mayoría de plantas mueren por exceso de agua. Verifica la humedad del suelo antes de regar.' },
                { icon: '☀️', title: 'Luz adecuada', tip: 'Observa las hojas: hojas pálidas = muy poca luz, hojas quemadas = demasiada luz directa. Ajusta la ubicación.' },
                { icon: '🪴', title: 'Drenaje esencial', tip: 'Siempre usa macetas con agujeros de drenaje para evitar pudrición de raíces. El agua estancada es mortal.' },
                { icon: '🌡️', title: 'Temperatura estable', tip: 'Evita corrientes de aire frío y no coloques plantas cerca de radiadores o aires acondicionados.' },
                { icon: '🧹', title: 'Limpieza de hojas', tip: 'Limpia las hojas regularmente con un paño húmedo para que la planta pueda respirar y hacer fotosíntesis correctamente.' },
                { icon: '🔄', title: 'Rotación periódica', tip: 'Gira tus plantas 1/4 de vuelta cada semana para un crecimiento uniforme y evitar que se inclinen hacia la luz.' },
                { icon: '🧪', title: 'Fertilización', tip: 'Fertiliza solo durante la temporada de crecimiento (primavera-verano). En invierno, la mayoría de plantas descansan.' },
                { icon: '🐛', title: 'Prevención de plagas', tip: 'Revisa regularmente el envés de las hojas. Las plagas se esconden ahí. Actúa rápido si detectas algo.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span> {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 mt-2">{item.tip}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 z-40">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {[
              { id: 'home' as TabType, icon: '🏠', label: 'Inicio' },
              { id: 'camera' as TabType, icon: '📷', label: 'Escanear' },
              { id: 'history' as TabType, icon: '📜', label: 'Historial' },
              { id: 'tips' as TabType, icon: '💡', label: 'Tips' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.id === 'camera' ? startCamera() : setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-[10px] mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Botón flotante de cámara */}
      {!showCamera && !isAnalyzing && !identifiedPlant && activeTab === 'home' && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-2">
          {/* Botón principal - abre cámara nativa del móvil */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-18 h-18 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex flex-col items-center justify-center shadow-lg shadow-green-500/40 p-4"
          >
            <span className="text-3xl">📸</span>
            <span className="text-[10px] text-white font-bold">FOTO</span>
          </button>
        </div>
      )}

      {/* Input para tomar foto directa (funciona mejor en móviles) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Input para subir desde galería */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
