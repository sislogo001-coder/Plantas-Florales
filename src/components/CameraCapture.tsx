import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, X, RotateCcw, Check, Upload, Zap } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
  isAnalyzing: boolean
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsCameraLoading(true)
      
      // Detener stream anterior si existe
      stopCamera()
      
      // Solicitar acceso a la cámara
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        },
        audio: false
      })
      
      streamRef.current = mediaStream
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsCameraActive(true)
                setIsCameraLoading(false)
              })
              .catch(err => {
                console.error('Error playing video:', err)
                setError('Error al reproducir video')
                setIsCameraLoading(false)
              })
          }
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setIsCameraLoading(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Por favor permite el acceso a la cámara en la configuración de tu navegador.')
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara. Por favor conecta una cámara o sube una imagen.')
      } else if (err.name === 'NotReadableError') {
        setError('La cámara está siendo usada por otra aplicación.')
      } else {
        setError('No se pudo acceder a la cámara. Intenta subir una imagen.')
      }
    }
  }, [facingMode, stopCamera])

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    
    if (isCameraActive) {
      stopCamera()
      setTimeout(() => {
        startCamera()
      }, 300)
    }
  }, [facingMode, isCameraActive, stopCamera, startCamera])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Establecer el tamaño del canvas al del video
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Dibujar el frame actual del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convertir a imagen
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido.')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        setCapturedImage(imageData)
        stopCamera()
      }
      reader.onerror = () => {
        setError('Error al leer el archivo.')
      }
      reader.readAsDataURL(file)
    }
  }, [stopCamera])

  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black to-transparent absolute top-0 left-0 right-0 z-20">
        <button
          onClick={handleClose}
          className="p-3 bg-black/50 rounded-full text-white hover:text-orange-400 hover:bg-black/70 transition-all"
        >
          <X className="w-7 h-7" />
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera className="w-6 h-6 text-orange-400" />
          Capturar Planta
        </h2>
        <div className="w-12" />
      </div>

      {/* Camera View / Captured Image */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-950">
        
        {/* Estado de error */}
        {error && !capturedImage && (
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={startCamera}
                className="px-6 py-4 bg-orange-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Intentar de nuevo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-4 bg-gray-800 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 border-2 border-orange-500 hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Subir imagen desde galería
              </button>
            </div>
          </div>
        )}

        {/* Estado inicial - Esperando iniciar cámara */}
        {!isCameraActive && !capturedImage && !error && !isCameraLoading && (
          <div className="text-center p-6">
            <div className="w-36 h-36 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-camera-pulse shadow-2xl shadow-orange-500/30">
              <Camera className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Analiza tu planta</h3>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">Toma una foto de tu planta para conocer su estado de salud y cómo cuidarla</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startCamera}
                className="px-8 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Camera className="w-7 h-7" />
                Abrir Cámara
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-5 bg-gray-800 text-white rounded-2xl font-bold text-lg border-2 border-orange-500 hover:bg-gray-700 transition-all flex items-center justify-center gap-3"
              >
                <Upload className="w-6 h-6" />
                Subir Foto
              </button>
            </div>
          </div>
        )}

        {/* Estado cargando cámara */}
        {isCameraLoading && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-white text-xl font-semibold">Iniciando cámara...</p>
            <p className="text-gray-400 mt-2">Por favor permite el acceso</p>
          </div>
        )}

        {/* Video de la cámara */}
        {(isCameraActive || isCameraLoading) && !capturedImage && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {/* Imagen capturada */}
        {capturedImage && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Planta capturada"
              className="max-w-full max-h-full object-contain"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="w-28 h-28 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-orange-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-white text-2xl font-bold mb-2">Analizando planta...</p>
                <p className="text-gray-400">Detectando estado de salud</p>
                <div className="mt-6 flex gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marco de enfoque cuando la cámara está activa */}
        {isCameraActive && !capturedImage && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Marco principal */}
            <div className="absolute inset-8 md:inset-16 border-2 border-orange-500/40 rounded-3xl">
              {/* Esquinas */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />
            </div>
            
            {/* Círculo de enfoque central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 border-2 border-orange-400/60 rounded-full animate-focus-ring" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full" />
            </div>
            
            {/* Línea de escaneo */}
            <div className="absolute left-8 right-8 md:left-16 md:right-16 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-scan-line opacity-60" />
            
            {/* Texto de instrucción */}
            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2">
              <p className="text-white text-center bg-black/60 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm">
                📷 Centra la planta en el recuadro
              </p>
            </div>
          </div>
        )}

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Controles inferiores */}
      <div className="p-6 bg-gradient-to-t from-black via-black/95 to-transparent">
        {/* Controles cuando la cámara está activa */}
        {isCameraActive && !capturedImage && (
          <div className="flex items-center justify-center gap-8">
            {/* Cambiar cámara */}
            <button
              onClick={switchCamera}
              className="p-4 bg-gray-800/80 rounded-full text-white hover:bg-gray-700 transition-all hover:scale-110"
              title="Cambiar cámara"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            
            {/* Botón de captura */}
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/50 transform hover:scale-110 transition-all animate-camera-pulse"
            >
              <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20" />
              </div>
            </button>
            
            {/* Subir desde galería */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-gray-800/80 rounded-full text-white hover:bg-gray-700 transition-all hover:scale-110"
              title="Subir imagen"
            >
              <Upload className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Controles cuando hay imagen capturada */}
        {capturedImage && !isAnalyzing && (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={retakePhoto}
              className="px-6 py-4 bg-gray-800 rounded-2xl text-white font-semibold flex items-center gap-3 hover:bg-gray-700 transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              Tomar otra
            </button>
            <button
              onClick={confirmPhoto}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl text-white font-bold flex items-center gap-3 shadow-lg shadow-green-500/40 hover:shadow-green-500/60 transition-all transform hover:scale-105"
            >
              <Check className="w-6 h-6" />
              Analizar Planta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraCapture
