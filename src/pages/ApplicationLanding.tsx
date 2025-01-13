import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

import BackgroundIconImage from "../public/images/ic_launcher_background.png";
import ForegroundIconImage from "../public/images/ic_launcher_foreground.png";

export const ApplicationLanding = () => {


  const iosAppUrl = "https://apps.apple.com/app/id6740282799";
  const androidAppUrl = "https://play.google.com/store/apps/details?id=com.sahikaca.tr";

  // Mouse movement tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate relative position (-0.5 to 0.5)
      mouseX.set((e.clientX - centerX) / rect.width);
      mouseY.set((e.clientY - centerY) / rect.height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>sahi kaca? - Mobil Uygulamamızı İndirin | iOS ve Android</title>
        <meta name="title" content="sahi kaca? - Mobil Uygulamamızı İndirin | iOS ve Android" />
        <meta name="description" content="sahi kaca? mobil uygulamasını indirin! Daha hızlı, daha akıcı bir deneyim için şimdi iOS ve Android'de." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sahikaca.com/indir" />
        <meta property="og:title" content="sahi kaca? - Mobil Uygulamamızı İndirin | iOS ve Android" />
        <meta property="og:description" content="sahi kaca? mobil uygulamasını indirin! Daha hızlı, daha akıcı bir deneyim için şimdi iOS ve Android'de." />

        {/* Twitter */}
        <meta property="twitter:card" content="app" />
        <meta property="twitter:url" content="https://sahikaca.com/indir" />
        <meta property="twitter:title" content="sahi kaca? - Mobil Uygulamamızı İndirin" />
        <meta property="twitter:description" content="sahi kaca? mobil uygulamasını indirin! Daha hızlı, daha akıcı bir deneyim için şimdi iOS ve Android'de." />

        {/* iOS App Meta Tags */}
        <meta name="apple-itunes-app" content="app-id=6740282799" />
        
        {/* Android App Meta Tags */}
        <meta name="google-play-app" content="app-id=com.sahikaca.tr" />

        {/* App Links Meta Tags */}
        <meta property="al:ios:url" content="sahikaca://" />
        <meta property="al:ios:app_store_id" content="6740282799" />
        <meta property="al:ios:app_name" content="sahikaca?" />
        <meta property="al:android:url" content="sahikaca://" />
        <meta property="al:android:package" content="com.sahikaca.tr" />
        <meta property="al:android:app_name" content="sahikaca?" />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-amber-500/10" />
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 text-center">
          {/* 3D App Icon */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              transformPerspective: 1000
            }}
            className="relative w-56 h-56 mx-auto mb-16 group cursor-pointer"
          >
            {/* 3D layers */}
            <div className="relative w-full h-full transform-style-3d transition-transform duration-1000">
              {/* Background Layer with Shine */}
              <div className="absolute inset-0 w-full h-full rounded-[25%] overflow-hidden">
                <div 
                  className="absolute inset-0 w-[200%] animate-shine bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full" 
                  style={{ 
                    transform: 'translateZ(1px)',
                    backgroundSize: '50% 100%'
                  }}
                />
                <img 
                  src={BackgroundIconImage} 
                  alt="App Background" 
                  className="w-full h-full object-cover shadow-xl relative z-10"
                />
              </div>
              
              {/* Middle Rectangle Layer */}
              <motion.div 
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'translateZ(30px)' }}
              >
                <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[25%]" />
              </motion.div>

              {/* Foreground Layer */}
              <motion.div 
                className="absolute inset-0 w-full h-full"
                style={{ transform: 'translateZ(60px)' }}
              >
                <img 
                  src={ForegroundIconImage} 
                  alt="App Foreground" 
                  className="w-full h-full object-contain rounded-[25%]"
                />
              </motion.div>
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/20 blur-xl rounded-full" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Mobil Uygulamamızı Keşfedin
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl mx-auto"
          >
            Daha hızlı, daha akıcı bir deneyim için mobil uygulamamızı indirin.
          </motion.p>

          {/* App Store Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-6 justify-center mb-16"
          >
            <a 
              href={iosAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%)',
                color: 'white'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/30 to-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaApple className="w-8 h-8 mr-4 relative z-10" />
              <div className="text-left relative z-10">
                <div className="text-sm opacity-90">Download on the</div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </a>

            <a 
              href={androidAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #34a853 0%, #1e8e3e 100%)',
                color: 'white'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-green-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaGooglePlay className="w-8 h-8 mr-4 relative z-10" />
              <div className="text-left relative z-10">
                <div className="text-sm opacity-90">Get it on</div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </a>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Akıcı Deneyim",
                description: "Oyunlarınızı daha hızlı oynayabilirsiniz"
              },
              {
                title: "Anlık Bildirimler",
                description: "Yeni oyunlar ve güncellemelerden anında haberdar olun"
              },
              {
                title: "Hızlı Erişim",
                description: "Favori oyunlarınıza tek tıkla ulaşın"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="p-6 bg-bg-secondary rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-color/10 rounded-full filter blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-color/10 rounded-full filter blur-3xl" />
      </div>
    </>
  );
}; 