import React from 'react'

const AnimatedBackground: React.FC = () => {
  // URLs de tulipanes reales de Unsplash
  const tulipImages = [
    'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&q=80',
    'https://images.unsplash.com/photo-1518701005037-d53b1f67bb1c?w=400&q=80',
    'https://images.unsplash.com/photo-1491039628585-651e8b8bd6a5?w=400&q=80',
    'https://images.unsplash.com/photo-1522165078674-49820eb62571?w=400&q=80',
    'https://images.unsplash.com/photo-1589994160839-163cd867cfe8?w=400&q=80',
  ]

  return (
    <div className="fixed inset-0 bg-black overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10" />
      
      {/* Tulipán 1 - Izquierda */}
      <div 
        className="absolute bottom-0 -left-5 w-48 md:w-64 h-72 md:h-96 z-0"
        style={{
          animation: 'sway 4s ease-in-out infinite',
          transformOrigin: 'bottom center'
        }}
      >
        <img 
          src={tulipImages[0]}
          alt="Tulipanes rojos"
          className="w-full h-full object-cover opacity-50 rounded-t-3xl"
          style={{ filter: 'brightness(0.6) saturate(1.2)' }}
        />
      </div>

      {/* Tulipán 2 - Centro izquierda */}
      <div 
        className="absolute bottom-0 left-[15%] w-40 md:w-56 h-64 md:h-80 z-0"
        style={{
          animation: 'sway 5s ease-in-out infinite',
          animationDelay: '0.5s',
          transformOrigin: 'bottom center'
        }}
      >
        <img 
          src={tulipImages[1]}
          alt="Tulipanes rosas"
          className="w-full h-full object-cover opacity-40 rounded-t-3xl"
          style={{ filter: 'brightness(0.5) saturate(1.3)' }}
        />
      </div>

      {/* Tulipán 3 - Centro */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-52 md:w-72 h-80 md:h-[420px] z-0"
        style={{
          animation: 'swayReverse 6s ease-in-out infinite',
          animationDelay: '1s',
          transformOrigin: 'bottom center'
        }}
      >
        <img 
          src={tulipImages[2]}
          alt="Tulipanes amarillos"
          className="w-full h-full object-cover opacity-35 rounded-t-3xl"
          style={{ filter: 'brightness(0.45) saturate(1.4)' }}
        />
      </div>

      {/* Tulipán 4 - Centro derecha */}
      <div 
        className="absolute bottom-0 right-[15%] w-44 md:w-60 h-68 md:h-88 z-0"
        style={{
          animation: 'sway 4.5s ease-in-out infinite',
          animationDelay: '1.5s',
          transformOrigin: 'bottom center'
        }}
      >
        <img 
          src={tulipImages[3]}
          alt="Tulipanes naranjas"
          className="w-full h-full object-cover opacity-40 rounded-t-3xl"
          style={{ filter: 'brightness(0.55) saturate(1.2)' }}
        />
      </div>

      {/* Tulipán 5 - Derecha */}
      <div 
        className="absolute bottom-0 -right-5 w-48 md:w-64 h-72 md:h-96 z-0"
        style={{
          animation: 'swayReverse 5.5s ease-in-out infinite',
          animationDelay: '2s',
          transformOrigin: 'bottom center'
        }}
      >
        <img 
          src={tulipImages[4]}
          alt="Tulipanes morados"
          className="w-full h-full object-cover opacity-50 rounded-t-3xl"
          style={{ filter: 'brightness(0.6) saturate(1.2)' }}
        />
      </div>

      {/* Tulipanes en la parte superior (colgantes/invertidos) */}
      <div 
        className="absolute top-0 left-5 w-36 md:w-48 h-48 md:h-64 rotate-180 z-0"
        style={{
          animation: 'sway 5s ease-in-out infinite',
          animationDelay: '0.3s',
          transformOrigin: 'top center'
        }}
      >
        <img 
          src={tulipImages[1]}
          alt="Tulipanes"
          className="w-full h-full object-cover opacity-25 rounded-b-3xl"
          style={{ filter: 'brightness(0.35)' }}
        />
      </div>

      <div 
        className="absolute top-0 right-10 w-40 md:w-52 h-52 md:h-72 rotate-180 z-0"
        style={{
          animation: 'swayReverse 4.5s ease-in-out infinite',
          animationDelay: '0.8s',
          transformOrigin: 'top center'
        }}
      >
        <img 
          src={tulipImages[3]}
          alt="Tulipanes"
          className="w-full h-full object-cover opacity-25 rounded-b-3xl"
          style={{ filter: 'brightness(0.35)' }}
        />
      </div>

      {/* Pétalos cayendo */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        {[...Array(12)].map((_, i) => {
          const colors = ['#ef4444', '#f97316', '#ec4899', '#fbbf24', '#a855f7', '#f43f5e']
          return (
            <div
              key={i}
              className="absolute animate-petal-fall"
              style={{
                left: `${5 + (i * 8)}%`,
                top: '-30px',
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${10 + (i % 4) * 2}s`
              }}
            >
              <div 
                className="w-3 h-5 md:w-4 md:h-6 rounded-full"
                style={{
                  background: colors[i % colors.length],
                  opacity: 0.5,
                  transform: `rotate(${45 + i * 15}deg)`
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Partículas de polen/luz flotantes */}
      <div className="absolute inset-0 z-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              background: i % 2 === 0 ? 'rgba(251, 146, 60, 0.5)' : 'rgba(250, 204, 21, 0.4)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              boxShadow: '0 0 10px rgba(251, 146, 60, 0.3)'
            }}
          />
        ))}
      </div>

      {/* Rayos de luz suaves */}
      <div className="absolute top-0 left-1/4 w-2 h-80 bg-gradient-to-b from-orange-500/15 to-transparent transform rotate-12 blur-lg z-5" />
      <div className="absolute top-0 right-1/3 w-2 h-72 bg-gradient-to-b from-pink-500/10 to-transparent transform -rotate-12 blur-lg z-5" />
      <div className="absolute top-0 left-1/2 w-1 h-64 bg-gradient-to-b from-yellow-500/10 to-transparent blur-md z-5" />
      
      {/* Efecto de viñeta */}
      <div className="absolute inset-0 z-10 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }}
      />
    </div>
  )
}

export default AnimatedBackground
