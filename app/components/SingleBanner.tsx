'use client';

import { useState, useEffect } from 'react';

interface Asset {
  id: string;
  name: string;
  source: string;
}

interface Banner {
  id: string;
  assets: Asset[];
  channels: {
    id: string;
    code: string;
  }[];
}

interface SingleBannerProps {
  banners: Banner[];
}

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return windowWidth;
};

export function SingleBanner({ banners }: SingleBannerProps) {
  // Handle missing banners safely
  if (!banners || banners.length < 1) {
    return null;
  }

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 1024;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect for banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [banners.length]);

  const goToNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="w-full mb-8 relative z-[10]">
      <div className="w-full aspect-[3/1] relative">
        {banners.map((banner, index) => (
          <img
            key={banner.id}
            src={banner.assets[0]?.source || '/placeholder.svg'}
            alt={banner.assets[0]?.name || 'Banner'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      
      {/* Navigation buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPreviousSlide}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-80 transition-all touch-manipulation rounded-full"
          >
            <span className="text-sm sm:text-base">&lt;</span>
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-60 text-white p-1.5 sm:p-2 rounded-full hover:bg-opacity-80 transition-all touch-manipulation rounded-full"
          >
            <span className="text-sm sm:text-base">&gt;</span>
          </button>
        </>
      )}
      
      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all touch-manipulation ${
                index === currentIndex ? 'bg-white' : 'bg-gray-400'
              }`}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}
