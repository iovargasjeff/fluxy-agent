'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, Key, Table as TableIcon } from 'lucide-react';

export default function BottomCTA() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6 relative z-10 overflow-hidden bg-transparent">
      
      {/* Scattered UI Floating Elements */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none select-none hidden md:block">
        
        {/* Soft airy background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-blue-100/40 blur-[100px] rounded-full" />
        
        {/* 1. Yellow Sticky Note */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [-12, -8, -12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex absolute top-[10%] left-[2%] lg:left-[4%] bg-yellow-300 w-32 h-32 rounded-sm rounded-br-3xl shadow-lg items-center justify-center p-4 border border-yellow-400"
        >
          <span className="font-mono text-yellow-900 font-bold text-center text-sm leading-tight rotate-3">Design<br/>Database!</span>
          {/* Folded corner effect */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 rounded-tl-xl shadow-[-2px_-2px_4px_rgba(0,0,0,0.1)]" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}></div>
        </motion.div>

        {/* 2. Database Table UI Card */}
        <motion.div 
          animate={{ y: [0, 25, 0], rotate: [5, 10, 5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden md:block absolute top-[20%] right-[2%] lg:right-[4%] bg-white rounded-xl shadow-xl border border-slate-200 w-48 overflow-hidden"
        >
          <div className="bg-[#1A6CF6] px-3 py-2 flex items-center gap-2 text-white">
            <TableIcon size={14} />
            <span className="text-xs font-bold">Users</span>
          </div>
          <div className="p-3 space-y-2 bg-white">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-medium text-slate-700">id</span>
              <span className="text-slate-400">UUID</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-medium text-slate-700">email</span>
              <span className="text-slate-400">VARCHAR</span>
            </div>
          </div>
        </motion.div>

        {/* 3. Purple Bubble Pill */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [-15, -20, -15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] left-[5%] lg:left-[8%] bg-[#7C3AED] text-white px-5 py-2.5 rounded-full shadow-lg shadow-purple-500/30 font-bold text-sm flex items-center gap-2"
        >
          <Key size={16} />
          Relations
        </motion.div>

        {/* 4. Green Database Icon */}
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [10, 5, 10] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[15%] right-[5%] lg:right-[8%] bg-emerald-400 text-emerald-950 p-4 rounded-[1.25rem] shadow-lg shadow-emerald-500/20 border border-emerald-300"
        >
          <Database size={28} />
        </motion.div>

        {/* Geometric Abstract Shapes */}
        
        {/* Pink Diamond */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [45, 90, 45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] lg:top-[20%] right-[15%] lg:right-[25%] w-8 h-8 rounded-sm bg-gradient-to-tr from-pink-500 to-pink-300 shadow-lg shadow-pink-500/20"
        />
        
        {/* Blue Ring */}
        <motion.div 
          animate={{ y: [0, 15, 0], scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[35%] lg:bottom-[40%] left-[8%] lg:left-[15%] w-10 h-10 rounded-full border-4 border-blue-400 shadow-sm opacity-80"
        />
        
        {/* Orange Capsule (Pill) */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [-30, -20, -30] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[10%] left-[25%] lg:left-[30%] w-16 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-300 shadow-lg shadow-orange-500/20"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative text-center z-10 pt-10">
        
        <h2 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 text-slate-900 tracking-tight leading-tight">
          Empieza a diseñar tu<br className="hidden md:block"/> base de datos ahora
        </h2>
        
        <p className="relative text-slate-600 text-lg md:text-xl mb-10 max-w-xl mx-auto font-medium">
          Únete a cientos de equipos que ya diseñan mejor. Crea, comparte y colabora donde sea que estés.
        </p>
        
        <Link 
          href="/register"
          className="relative inline-flex items-center justify-center bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/25 pointer-events-auto"
        >
          Crear tu espacio de trabajo
        </Link>
      </div>
    </section>
  );
}
