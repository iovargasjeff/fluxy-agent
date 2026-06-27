'use client';

import { Code2, Network, Users, Download, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const cardVariants = {
    hidden: (direction: string) => {
      let x = 0, y = 0, rotate = 0;
      switch (direction) {
        case 'top-left': x = -150; y = -150; rotate = -15; break;
        case 'top-right': x = 150; y = -150; rotate = 15; break;
        case 'bottom-left': x = -150; y = 150; rotate = -10; break;
        case 'bottom-right': x = 150; y = 150; rotate = 10; break;
      }
      return { opacity: 0, x, y, rotate, scale: 0.85 };
    },
    visible: (direction: string) => {
      let delay = 0;
      switch (direction) {
        case 'top-left': delay = 0.1; break;
        case 'top-right': delay = 0.2; break;
        case 'bottom-left': delay = 0.3; break;
        case 'bottom-right': delay = 0.4; break;
      }
      return {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        transition: { 
          type: 'spring' as const, 
          stiffness: 120, 
          damping: 14, 
          delay 
        }
      };
    }
  };

  return (
    <section className="py-24 px-6 relative z-10" id="producto">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Title area with floating cursors */}
        <div className="relative inline-block mb-4">
          
          {/* Floating Cursor 1: Aida */}
          <motion.div 
            initial={{ opacity: 0, x: -50, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="absolute -top-10 -left-16 sm:-left-24 md:-left-32 z-20 pointer-events-none"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="bg-rose-100 border border-rose-300 text-rose-800 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform -rotate-6">
                <div className="w-4 h-4 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Aida" className="w-full h-full object-cover" />
                </div>
                Aida
              </div>
              <svg className="absolute -bottom-2 right-4 w-4 h-4 text-rose-300 transform rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 22L20 12L4 2V22Z" />
              </svg>
            </motion.div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center text-slate-900 tracking-tight relative z-10"
          >
            Poderoso, pero simple.
          </motion.h2>

          {/* Floating Cursor 2: DBCanvas AI */}
          <motion.div 
            initial={{ opacity: 0, x: 50, y: -20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false }}
            transition={{ type: 'spring', delay: 0.4 }}
            className="absolute -bottom-6 -right-12 sm:-right-20 md:-right-28 z-20 pointer-events-none"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
              <div className="bg-purple-50 border border-purple-400 text-purple-700 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform rotate-6">
                <Sparkles className="w-3 h-3 text-purple-500" />
                DBCanvas AI
              </div>
              <svg className="absolute -top-3 -left-1 w-5 h-5 text-purple-500 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 22L20 12L4 2V22Z" />
              </svg>
            </motion.div>
          </motion.div>

        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ delay: 0.3 }}
          className="text-slate-600 text-center mb-16 text-lg max-w-2xl mx-auto"
        >
          Descubre cómo transformar tu forma de diseñar bases de datos con nuestra interfaz intuitiva.
        </motion.p>
        
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[600px] w-full max-w-5xl">
          
          {/* Card 1: Yellow - Top Left (span 2 cols) */}
          <motion.div 
            custom="top-left"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="bg-[#FFB82E] rounded-3xl p-8 relative overflow-hidden md:col-span-2 md:row-span-1 shadow-lg group origin-bottom-right"
          >
            <div className="relative z-10 w-full md:w-2/3">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-amber-950 leading-tight">
                Pega tu código SQL o NoSQL.
              </h3>
              <p className="text-amber-900 font-medium opacity-90">
                Soportamos múltiples dialectos. Solo tienes que pegar tu esquema y nosotros hacemos el resto.
              </p>
            </div>
            
            {/* Decorative element */}
            <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-amber-100/40 rounded-full blur-2xl group-hover:bg-amber-100/60 transition-colors" />
            <motion.div 
              animate={{ rotate: [6, 12, 6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-8 bg-white/40 p-4 rounded-2xl shadow-sm backdrop-blur-sm"
            >
              <Code2 className="w-8 h-8 text-amber-900" />
            </motion.div>
          </motion.div>

          {/* Card 2: Blue - Top Right (span 2 cols) */}
          <motion.div 
            custom="top-right"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="bg-[#528BFF] rounded-3xl p-8 relative overflow-hidden md:col-span-2 md:row-span-1 shadow-lg group origin-bottom-left"
          >
            <div className="relative z-10 w-full md:w-3/4">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white leading-tight">
                Autolayout inteligente.
              </h3>
              <p className="text-blue-100 font-medium">
                El diagrama se organiza solo. Olvídate de arrastrar cajas infinitamente para que se vea ordenado.
              </p>
            </div>
            
            {/* Decorative element */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-4 right-4 bg-white/20 p-6 rounded-3xl backdrop-blur-md"
            >
              <Network className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>

          {/* Card 3: Purple - Bottom Left (span 1 col) */}
          <motion.div 
            custom="bottom-left"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="bg-[#B983FF] rounded-3xl p-8 relative overflow-hidden md:col-span-1 md:row-span-1 shadow-lg group flex flex-col justify-between origin-top-right"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-white leading-tight">
                Exporta al instante.
              </h3>
              <p className="text-purple-100 font-medium text-sm mt-2">
                Descarga en SVG o PNG en alta resolución con un clic.
              </p>
            </div>
            
            {/* Decorative element */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="self-end mt-4 bg-white p-4 rounded-full shadow-lg"
            >
              <Download className="w-6 h-6 text-purple-600" />
            </motion.div>
          </motion.div>

          {/* Card 4: Orange/Red - Bottom Right (span 3 cols) */}
          <motion.div 
            custom="bottom-right"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="bg-[#FF6B4A] rounded-3xl p-8 relative overflow-hidden md:col-span-3 md:row-span-1 shadow-lg group flex flex-col justify-end origin-top-left"
          >
            <div className="relative z-10 w-full md:w-1/2">
              <h3 className="text-3xl md:text-4xl font-bold mb-3 text-white leading-tight">
                Colaboración en tiempo real.
              </h3>
              <p className="text-red-100 font-medium">
                Diseña y debate cambios con tu equipo directamente sobre el lienzo. Múltiples cursores al mismo tiempo.
              </p>
            </div>
            
            {/* Decorative elements - floating cursors */}
            <motion.div 
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 right-[10%] bg-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-slate-800">Ana está editando...</span>
            </motion.div>
            <motion.div 
              animate={{ y: [0, 8, 0], rotate: [12, 5, 12] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-[40%] right-[30%] bg-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 transform rotate-12"
            >
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs font-bold text-slate-800">Carlos</span>
            </motion.div>
            <div className="absolute bottom-[-10%] right-[-5%] bg-white/20 p-12 rounded-[3rem] backdrop-blur-sm transform -rotate-12">
              <Users className="w-24 h-24 text-white opacity-80" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
