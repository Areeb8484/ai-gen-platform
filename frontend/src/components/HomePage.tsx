import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Tilt from 'react-parallax-tilt';

const TYPING_WORDS = ['AI GEN', 'CREATE', 'INNOVATE', 'GENERATE'];

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [currentWord, setCurrentWord] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const xRange = useTransform(scrollY, [0, 1000], [0, 100]);
  const opacityRange = useTransform(scrollY, [0, 300], [1, 0.3]);
  
  const springConfig = { stiffness: 300, damping: 30 };
  const y = useSpring(xRange, springConfig);
  const opacity = useSpring(opacityRange, springConfig);

  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    setIsLoaded(true);
    
    // Typing animation
    const typingTimer = setTimeout(() => {
      const currentWordText = TYPING_WORDS[currentWord];
      
      if (!isDeleting && currentChar < currentWordText.length) {
        setCurrentChar(prev => prev + 1);
      } else if (isDeleting && currentChar > 0) {
        setCurrentChar(prev => prev - 1);
      } else if (!isDeleting && currentChar === currentWordText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentChar === 0) {
        setIsDeleting(false);
        setCurrentWord(prev => (prev + 1) % TYPING_WORDS.length);
      }
    }, isDeleting ? 100 : 150);

    // Mouse tracking for cursor trail
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const newTrailPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
      };
      
      setTrail(prev => [...prev.slice(-8), newTrailPoint]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(typingTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentWord, currentChar, isDeleting]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-purple-950/30"></div>
      </div>

      {/* Mouse cursor trail */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: point.x - 4,
              top: point.y - 4,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 0,
            }}
            transition={{ 
              duration: 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
        
        {/* Cursor glow effect */}
        <motion.div
          className="absolute w-8 h-8 bg-cyan-400/30 rounded-full blur-md pointer-events-none"
          style={{
            left: mousePosition.x - 16,
            top: mousePosition.y - 16,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section 
          ref={heroRef}
          className="min-h-screen flex items-center justify-center px-4 py-16"
          style={{ opacity }}
        >
          <div className="text-center max-w-6xl mx-auto">
            <AnimatePresence>
              {isLoaded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="mb-8"
                >
                  <motion.div 
                    className="w-40 h-40 mx-auto rounded-full relative mb-8"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 p-1">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <img 
                          src="/ai-gen-logo.png" 
                          alt="AI Gen Platform Logo" 
                          className="w-32 h-32 rounded-full object-cover" 
                        />
                      </div>
                    </div>
                    <div className="absolute -inset-4 rounded-full border border-cyan-400/30 animate-pulse"></div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <h1 className="text-5xl md:text-9xl font-black mb-6 relative">
                <span className="relative bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                  {TYPING_WORDS[currentWord].substring(0, currentChar)}
                  <motion.span
                    className="inline-block w-1 h-20 md:h-28 bg-cyan-400 ml-2"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </span>
              </h1>
              
              <motion.div
                className="w-32 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full mb-8"
                initial={{ width: 0 }}
                animate={heroInView ? { width: 128 } : {}}
                transition={{ duration: 1, delay: 1 }}
              />

              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-200 to-cyan-300 bg-clip-text text-transparent mb-8">
                PLATFORM
              </h2>
            </motion.div>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 1.2 }}
            >
              Discover the power of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold">
                advanced AI
              </span>{' '}
              to create content with exceptional quality. Generate{' '}
              <motion.span 
                className="text-cyan-400 font-semibold"
                whileHover={{ scale: 1.1, color: '#00ffff' }}
              >
                text
              </motion.span>
              ,{' '}
              <motion.span 
                className="text-purple-400 font-semibold"
                whileHover={{ scale: 1.1, color: '#a855f7' }}
              >
                images
              </motion.span>
              , and{' '}
              <motion.span 
                className="text-pink-400 font-semibold"
                whileHover={{ scale: 1.1, color: '#ec4899' }}
              >
                code
              </motion.span>{' '}
              with extreme precision.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <Link to="/login">
                <motion.button
                  className="group relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white px-12 py-5 rounded-full font-bold text-xl overflow-hidden"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(6, 182, 212, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className="relative z-10">LAUNCH PLATFORM</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </Link>

              <Link to="/register">
                <motion.button
                  className="group relative bg-transparent text-cyan-400 px-12 py-5 rounded-full font-bold text-xl border-2 border-cyan-400/50 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    scale: 1.05, 
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className="relative z-10">SIGN UP</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10"
                    initial={{ scale: 0, borderRadius: '50%' }}
                    whileHover={{ scale: 1, borderRadius: '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Live Stats Section */}
        <motion.section
          ref={statsRef}
          className="py-16 px-4"
          initial={{ opacity: 0 }}
          animate={statsInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent mb-4">
                TRUSTED BY CREATORS WORLDWIDE
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Active Users */}
              <motion.div
                className="relative bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-xl p-8 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-500 overflow-hidden group"
                initial={{ opacity: 0, x: -50 }}
                animate={statsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <motion.div
                    className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4"
                    initial={{ scale: 0 }}
                    animate={statsInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 200 }}
                  >
                    500+
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Active Creators</h3>
                  <p className="text-gray-300">Innovating with AI daily</p>
                </div>
                
                {/* Animated particles */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Requests Processed */}
              <motion.div
                className="relative bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl p-8 rounded-3xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 overflow-hidden group"
                initial={{ opacity: 0, x: 50 }}
                animate={statsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 1, delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <motion.div
                    className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4"
                    initial={{ scale: 0 }}
                    animate={statsInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.8, type: 'spring', stiffness: 200 }}
                  >
                    5K
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Requests</h3>
                  <p className="text-gray-300">Successfully processed</p>
                </div>

                {/* Animated particles */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-purple-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Live indicator */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={statsInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-green-400 font-semibold">LIVE STATS</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          ref={featuresRef}
          className="py-20 px-4"
          style={{ y }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1 }}
            >
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent mb-4">
                AI CAPABILITIES
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📄',
                  title: 'Text Generation',
                  description: 'Advanced AI language models that create human-like content with exceptional coherence and creativity for any purpose.',
                  gradient: 'from-cyan-500/20 to-blue-600/20',
                  borderGradient: 'from-cyan-400 to-blue-500',
                  delay: 0.2
                },
                {
                  icon: '🎨',
                  title: 'Image Generation',
                  description: 'Create stunning visuals and artwork from natural language descriptions with incredible detail and artistic flair.',
                  gradient: 'from-purple-500/20 to-pink-600/20',
                  borderGradient: 'from-purple-400 to-pink-500',
                  delay: 0.4
                },
                {
                  icon: '💻',
                  title: 'Code Generation',
                  description: 'Generate clean, efficient code across multiple programming languages with intelligent optimization and best practices.',
                  gradient: 'from-green-500/20 to-emerald-600/20',
                  borderGradient: 'from-green-400 to-emerald-500',
                  delay: 0.6
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 80, rotateX: 45 }}
                  animate={featuresInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                  transition={{ duration: 1, delay: feature.delay }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <Tilt
                    glareEnable={true}
                    glareMaxOpacity={0.2}
                    glareColor="#ffffff"
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                  >
                    <div className={`group relative bg-gradient-to-br ${feature.gradient} backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 h-80 flex flex-col justify-between overflow-hidden`}>
                      {/* Animated border */}
                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                        <div className="absolute inset-[1px] rounded-3xl bg-black/90"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <motion.div
                          className="text-6xl mb-6 filter drop-shadow-lg"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          {feature.icon}
                        </motion.div>
                        
                        <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-cyan-300 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        
                        <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>

                      {/* Hover effect particles */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {[...Array(10)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: Math.random() * 2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section 
          className="py-20 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
                <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent mb-6">
                  READY TO GET STARTED?
                </h3>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of creators and developers using our AI platform.
                </p>
                <Link to="/login">
                  <motion.button
                    className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white px-16 py-6 rounded-full font-bold text-xl"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 60px rgba(6, 182, 212, 0.6)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    LAUNCH PLATFORM
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default HomePage;
