'use client';

import { useState } from 'react';
import { Zap, Network, Link2, Share2, Database, Code2, Workflow, Layout, GitMerge, Key, Cpu, Download, Image as ImageIcon, FileCode2, Send, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const bgIcons = [
  // 0: Realtime
  [
    { Icon: Database, size: 64, props: { top: '20%', left: '5%' }, animate: { y: [0, -30, 0], rotate: [0, 5, 0] } },
    { Icon: Code2, size: 80, props: { top: '60%', left: '8%' }, animate: { y: [0, 40, 0], rotate: [0, -10, 0] } },
    { Icon: Zap, size: 72, props: { top: '15%', right: '5%' }, animate: { y: [0, -40, 0], rotate: [0, 15, 0] } },
    { Icon: Clock, size: 64, props: { bottom: '20%', right: '8%' }, animate: { y: [0, 20, 0], rotate: [0, -5, 0] } }
  ],
  // 1: Autolayout
  [
    { Icon: Network, size: 64, props: { top: '20%', left: '5%' }, animate: { y: [0, -30, 0], rotate: [0, 5, 0] } },
    { Icon: Layout, size: 80, props: { top: '60%', left: '8%' }, animate: { y: [0, 40, 0], rotate: [0, -10, 0] } },
    { Icon: Share2, size: 72, props: { top: '15%', right: '5%' }, animate: { y: [0, -40, 0], rotate: [0, 15, 0] } },
    { Icon: GitMerge, size: 64, props: { bottom: '20%', right: '8%' }, animate: { y: [0, 20, 0], rotate: [0, -5, 0] } }
  ],
  // 2: Relations
  [
    { Icon: Link2, size: 64, props: { top: '20%', left: '5%' }, animate: { y: [0, -30, 0], rotate: [0, 5, 0] } },
    { Icon: Key, size: 80, props: { top: '60%', left: '8%' }, animate: { y: [0, 40, 0], rotate: [0, -10, 0] } },
    { Icon: Database, size: 72, props: { top: '15%', right: '5%' }, animate: { y: [0, -40, 0], rotate: [0, 15, 0] } },
    { Icon: Cpu, size: 64, props: { bottom: '20%', right: '8%' }, animate: { y: [0, 20, 0], rotate: [0, -5, 0] } }
  ],
  // 3: Export
  [
    { Icon: Download, size: 64, props: { top: '20%', left: '5%' }, animate: { y: [0, -30, 0], rotate: [0, 5, 0] } },
    { Icon: ImageIcon, size: 80, props: { top: '60%', left: '8%' }, animate: { y: [0, 40, 0], rotate: [0, -10, 0] } },
    { Icon: FileCode2, size: 72, props: { top: '15%', right: '5%' }, animate: { y: [0, -40, 0], rotate: [0, 15, 0] } },
    { Icon: Send, size: 64, props: { bottom: '20%', right: '8%' }, animate: { y: [0, 20, 0], rotate: [0, -5, 0] } }
  ]
];

const features = [
  {
    id: 'realtime',
    title: "Tiempo real absoluto",
    icon: <Zap className="w-6 h-6" />,
    description: "Cada cambio que haces en el esquema se refleja instantáneamente en el canvas. Sin botones de 'refrescar' ni tiempos de carga.",
    color: "bg-blue-100 text-blue-600",
    visual: (
      <div className="w-full h-full bg-[#0F172A] rounded-t-[2rem] flex items-center justify-center p-4 md:p-8 gap-4 md:gap-8 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
        
        {/* Left: Code Editor */}
        <div className="w-1/2 h-full bg-[#1E293B] rounded-xl p-4 border border-slate-700 font-mono text-[10px] md:text-xs text-slate-300 shadow-2xl relative z-10 flex flex-col justify-center">
           <div className="flex gap-1.5 mb-3">
             <div className="w-2 h-2 rounded-full bg-rose-500" />
             <div className="w-2 h-2 rounded-full bg-amber-500" />
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
           </div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.1 }}>
             <span className="text-pink-400">CREATE TABLE</span> <span className="text-emerald-300">users</span> (
           </motion.div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.1 }} className="ml-4">
             <span className="text-blue-300">id</span> <span className="text-purple-400">INT PRIMARY KEY</span>,
           </motion.div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.1 }} className="ml-4 flex items-center">
             <span className="text-blue-300">email</span> <span className="text-purple-400 ml-1">VARCHAR</span>
             <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-3 bg-blue-400 ml-1 inline-block" />
           </motion.div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.1 }}>);</motion.div>
        </div>
        
        {/* Right: ER Diagram Node */}
        <div className="w-1/2 flex items-center relative z-10">
           {/* Connecting pulse line */}
           <div className="absolute -left-8 top-1/2 w-8 h-px bg-blue-500/30 overflow-hidden">
             <motion.div 
                initial={{ x: -20 }} animate={{ x: 40 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-4 h-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" 
             />
           </div>

           <motion.div 
             initial={{ scale: 0.8, opacity: 0, y: 10 }}
             whileInView={{ scale: 1, opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
             className="w-full bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
           >
              <div className="bg-blue-50 px-3 py-2 text-[10px] md:text-xs font-bold text-blue-900 border-b border-blue-100 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> users
              </div>
              <motion.div 
                initial={{ backgroundColor: "#ffffff" }} whileInView={{ backgroundColor: ["#ffffff", "#eff6ff", "#ffffff"] }} transition={{ delay: 0.5, duration: 1 }}
                viewport={{ once: true }}
                className="px-3 py-2 text-[8px] md:text-[10px] flex justify-between border-b border-slate-50"
              >
                <span className="font-medium text-slate-700">id</span> <span className="text-slate-400 font-mono">INT</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "auto" }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, duration: 0.3 }}
                className="px-3 py-2 text-[8px] md:text-[10px] flex justify-between overflow-hidden bg-blue-50/30"
              >
                <span className="font-medium text-slate-700">email</span> <span className="text-blue-500 font-mono">VARCHAR</span>
              </motion.div>
           </motion.div>
        </div>
      </div>
    )
  },
  {
    id: 'autolayout',
    title: "Autolayout inteligente",
    icon: <Network className="w-6 h-6" />,
    description: "Nuestro algoritmo organiza automáticamente miles de nodos y relaciones para que siempre se vea perfecto.",
    color: "bg-purple-100 text-purple-600",
    visual: (
      <div className="w-full h-full bg-slate-50 rounded-t-[2rem] flex items-center justify-center relative overflow-hidden">
        {/* Central Node */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute z-20 w-24 md:w-32 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="bg-purple-50 px-2 py-1.5 text-[8px] md:text-[10px] font-bold text-purple-900 border-b border-purple-100 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> schema_core
          </div>
          <div className="p-2 space-y-1 bg-white">
             <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded" />
             <div className="h-1 md:h-1.5 w-2/3 bg-slate-100 rounded" />
          </div>
        </motion.div>

        {/* Child Node 1 */}
        <motion.div 
          initial={{ x: -50, y: 50, opacity: 0, rotate: -20 }}
          whileInView={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="absolute z-10 w-20 md:w-28 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          style={{ top: '60%', left: '10%' }}
        >
          <div className="bg-slate-50 px-2 py-1.5 text-[8px] md:text-[10px] font-bold text-slate-700 border-b border-slate-200 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> table_a
          </div>
          <div className="p-2 space-y-1">
             <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded" />
          </div>
        </motion.div>

        {/* Child Node 2 */}
        <motion.div 
          initial={{ x: 50, y: 50, opacity: 0, rotate: 20 }}
          whileInView={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
          className="absolute z-10 w-20 md:w-28 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          style={{ top: '60%', right: '10%' }}
        >
          <div className="bg-slate-50 px-2 py-1.5 text-[8px] md:text-[10px] font-bold text-slate-700 border-b border-slate-200 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> table_b
          </div>
          <div className="p-2 space-y-1">
             <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded" />
             <div className="h-1 md:h-1.5 w-4/5 bg-slate-100 rounded" />
          </div>
        </motion.div>

        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
           {/* Line to table_a */}
           <motion.path 
             d="M 50% 40% L 50% 50% L 25% 50% L 25% 60%" 
             stroke="#c084fc" strokeWidth="2" fill="none" strokeDasharray="4 4"
             initial={{ pathLength: 0 }}
             whileInView={{ pathLength: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.5 }}
           />
           {/* Line to table_b */}
           <motion.path 
             d="M 50% 40% L 50% 50% L 75% 50% L 75% 60%" 
             stroke="#c084fc" strokeWidth="2" fill="none" strokeDasharray="4 4"
             initial={{ pathLength: 0 }}
             whileInView={{ pathLength: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.7 }}
           />
        </svg>
      </div>
    )
  },
  {
    id: 'relations',
    title: "Relaciones automáticas",
    icon: <Link2 className="w-6 h-6" />,
    description: "Detecta claves foráneas y dibuja las flechas con la cardinalidad correcta sin configurar nada.",
    color: "bg-emerald-100 text-emerald-600",
    visual: (
      <div className="w-full h-full bg-slate-50 rounded-t-[2rem] flex items-center justify-center relative overflow-hidden px-2 md:px-8">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

        <div className="flex w-full max-w-[340px] justify-between items-center relative z-10 scale-[0.85] md:scale-100">
          {/* Table A (Orders) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="w-[110px] md:w-[120px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-emerald-50 px-2 py-1.5 text-[8px] md:text-[10px] font-bold text-emerald-900 border-b border-emerald-100 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> orders
            </div>
            <div className="px-2 py-1.5 text-[8px] md:text-[9px] flex justify-between border-b border-slate-50">
              <span className="text-slate-700 font-medium">id</span> <span className="text-amber-500 font-bold bg-amber-50 px-1 rounded">PK</span>
            </div>
            <motion.div 
              animate={{ backgroundColor: ["#ffffff", "#ecfdf5", "#ffffff"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="px-2 py-1.5 text-[8px] md:text-[9px] flex justify-between relative"
            >
              <span className="text-slate-700 font-medium">user_id</span> <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">FK</span>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }} 
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" 
              />
            </motion.div>
          </motion.div>

          {/* Connection Area */}
          <div className="flex-1 h-full relative flex items-center justify-center">
            {/* SVG Bezier connection */}
            <svg className="absolute inset-0 w-full h-[100px] -translate-y-[10px] pointer-events-none overflow-visible">
              <motion.path 
                d="M 0 50 C 40 50, 40 20, 80 20" 
                stroke="#10b981" strokeWidth="2" fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
              />
              {/* Traveling dot */}
              <motion.circle 
                r="3" fill="#10b981"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                animate={{ offsetDistance: ["0%", "100%"] } as any}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
                style={{ offsetPath: "path('M 0 50 C 40 50, 40 20, 80 20')" }}
                className="shadow-[0_0_10px_#10b981]"
              />
            </svg>
          </div>

          {/* Table B (Users) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="w-[110px] md:w-[120px] bg-white rounded-xl shadow-xl border border-slate-200 -translate-y-[30px] overflow-hidden"
          >
            <div className="bg-slate-50 px-2 py-1.5 text-[8px] md:text-[10px] font-bold text-slate-800 border-b border-slate-200 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> users
            </div>
            <motion.div 
              animate={{ backgroundColor: ["#ffffff", "#ecfdf5", "#ffffff"] }}
              transition={{ duration: 2.5, delay: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="px-2 py-1.5 text-[8px] md:text-[9px] flex justify-between border-b border-slate-50 relative"
            >
              <span className="text-slate-700 font-medium">id</span> <span className="text-amber-500 font-bold bg-amber-50 px-1 rounded">PK</span>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }} 
                transition={{ duration: 2.5, delay: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full -translate-x-1 shadow-[0_0_8px_#10b981]" 
              />
            </motion.div>
            <div className="px-2 py-1.5 text-[8px] md:text-[9px] flex justify-between">
              <span className="text-slate-700 font-medium">email</span> <span className="text-slate-400">VARCHAR</span>
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: 'export',
    title: "Exportación fácil",
    icon: <Share2 className="w-6 h-6" />,
    description: "Exporta tu diagrama completo como PNG, SVG vectorial o comparte un enlace público.",
    color: "bg-orange-100 text-orange-600",
    visual: (
      <div className="w-full h-full bg-slate-50 rounded-t-[2rem] flex items-center justify-center relative overflow-hidden">
        
        {/* Background Subtle Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#ffedd5_0%,transparent_70%)] opacity-50" />

        {/* Diagram to be scanned */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-28 md:w-32 mb-4 relative overflow-hidden"
          >
            {/* The Scanner Light */}
            <motion.div 
              animate={{ top: ["-10%", "110%", "110%", "-10%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent via-orange-400/30 to-transparent z-20 border-b-2 border-orange-400 shadow-[0_4px_15px_#f9731640]"
            />
            
            {/* Diagram content */}
            <div className="flex justify-center mb-2">
              <div className="w-10 md:w-12 h-6 bg-orange-100 rounded border border-orange-200" />
            </div>
            <div className="flex justify-between gap-2">
              <div className="w-8 md:w-10 h-8 bg-slate-50 rounded border border-slate-200" />
              <div className="w-8 md:w-10 h-8 bg-slate-50 rounded border border-slate-200" />
            </div>
            {/* Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path d="M 50% 35% L 50% 45% L 25% 45% L 25% 60%" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
              <path d="M 50% 35% L 50% 45% L 75% 45% L 75% 60%" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
            </svg>
          </motion.div>

          {/* Export Icons Popping Out */}
          <div className="flex gap-2 md:gap-3">
             <motion.div 
               animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }} 
               transition={{ duration: 2, repeat: Infinity, delay: 0 }}
               className="bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1 md:gap-1.5"
             >
               <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-orange-500" />
               <span className="text-[8px] md:text-[10px] font-bold text-slate-700">PNG</span>
             </motion.div>
             <motion.div 
               animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }} 
               transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
               className="bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1 md:gap-1.5"
             >
               <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-blue-500" />
               <span className="text-[8px] md:text-[10px] font-bold text-slate-700">SVG</span>
             </motion.div>
             <motion.div 
               animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }} 
               transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
               className="bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1 md:gap-1.5"
             >
               <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-500" />
               <span className="text-[8px] md:text-[10px] font-bold text-slate-700">SQL</span>
             </motion.div>
          </div>
        </div>
      </div>
    )
  }
];

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const feat = features[activeIndex];

  return (
    <section className="bg-transparent relative w-full" id="caracteristicas">
      {/* 
        ========================================================================
        DESKTOP VIEW (Scroll-Spy Sticky Layout) 
        - Visible solo en pantallas lg y superiores (hidden lg:block)
        ========================================================================
      */}
      <div className="hidden lg:block relative w-full">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="sticky top-0 h-screen w-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeIndex} 
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                {bgIcons[activeIndex]?.map((bgIcon, idx) => {
                  const IconComponent = bgIcon.Icon;
                  return (
                    <motion.div 
                      key={idx}
                      animate={bgIcon.animate}
                      transition={{ duration: 6 + idx, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                      className="absolute text-slate-400 opacity-40"
                      style={bgIcon.props}
                    >
                      <IconComponent size={bgIcon.size} strokeWidth={1} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Invisible Scroll Triggers */}
          <div className="w-full">
            {features.map((_, i) => (
              <motion.div 
                key={i}
                className="h-[80vh] w-full"
                onViewportEnter={() => setActiveIndex(i)}
                viewport={{ margin: "-40% 0px -40% 0px" }}
              />
            ))}
          </div>

          {/* Sticky Container */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-row gap-20 pointer-events-none px-6">
            
            {/* Left: Sticky Text Area */}
            <div className="w-1/3 sticky top-0 h-screen flex flex-col justify-center pointer-events-auto">
              <h2 className="text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
                Todo lo que necesitas, <span className="text-[#1A6CF6] block mt-2">sin lo que sobra.</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Diseñado específicamente para ingenieros de datos y desarrolladores que quieren ir rápido y sin fricciones.
              </p>
            </div>

            {/* Right: In-Place AnimatePresence Card Area */}
            <div className="w-2/3 sticky top-0 h-screen flex items-center justify-center pointer-events-auto">
              <div className="relative w-full h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={feat.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col"
                  >
                    <div className="p-12 flex-1 flex flex-col">
                      <div className="flex items-center mb-6">
                        <span className="text-xs font-bold bg-slate-100 text-slate-500 uppercase tracking-wider px-3 py-1 rounded-full">
                          {feat.id}
                        </span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900 mb-4">{feat.title}</h3>
                      <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                        {feat.description}
                      </p>
                    </div>
                    
                    <div className="h-[250px] w-full p-6 pb-0 flex items-end justify-center">
                      <div className="w-full h-full rounded-t-3xl overflow-hidden relative shadow-inner">
                        {feat.visual}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        MOBILE VIEW (Vertical Stack Layout)
        - Visible solo en pantallas < lg (block lg:hidden)
        - Sin 'sticky', sin scroll-spy. Puro flujo nativo para máxima fluidez.
        ========================================================================
      */}
      <div className="block lg:hidden max-w-xl mx-auto px-4 py-16">
        
        {/* Encabezado Móvil */}
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight leading-tight">
            Todo lo que necesitas, <br className="hidden sm:block"/>
            <span className="text-[#1A6CF6]">sin lo que sobra.</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Diseñado específicamente para ingenieros de datos y desarrolladores que quieren ir rápido.
          </p>
        </div>

        {/* Tarjetas Apiladas (Normal Scroll) */}
        <div className="flex flex-col gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="w-full bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col"
            >
              {/* Contenido de la Tarjeta */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${feature.color}`}>
                    {feature.id}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Área Visual */}
              <div className="h-[200px] sm:h-[250px] w-full px-4 sm:px-6 flex items-end justify-center">
                <div className="w-full h-full rounded-t-3xl overflow-hidden relative shadow-inner">
                  {feature.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
