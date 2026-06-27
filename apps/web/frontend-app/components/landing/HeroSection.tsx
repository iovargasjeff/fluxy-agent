'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, MousePointer2, Hand, MessageSquarePlus, Sun, Moon } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

const fullCode = `-- Prueba tu SQL aquí (Límite 4 tablas en Demo)

CREATE TABLE clientes (
  id UUID PRIMARY KEY,
  nombre VARCHAR,
  email VARCHAR
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  producto_id UUID REFERENCES productos(id),
  total NUMERIC
);

CREATE TABLE productos (
  id UUID PRIMARY KEY,
  nombre VARCHAR,
  precio NUMERIC,
  categoria_id UUID
);

CREATE TABLE categorias (
  id UUID PRIMARY KEY,
  nombre VARCHAR
);`;

export default function HeroSection() {
  const mounted = useMounted();
  const [typedCode, setTypedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTool, setActiveTool] = useState<'cursor' | 'hand' | 'comment'>('cursor');
  const [notes, setNotes] = useState<{ id: string, x: number, y: number, text: string }[]>([
    { id: '1', x: 400, y: 150, text: 'Revisar tipo de dato aquí 👇' }
  ]);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted) return;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullCode.length) {
        setTypedCode(fullCode.slice(0, currentIndex));
        currentIndex += 3;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'comment' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNotes([...notes, { id: Date.now().toString(), x, y, text: '' }]);
      setActiveTool('cursor');
    }
  };

  const updateNote = (id: string, text: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  };

  const showClientes = typedCode.includes('CREATE TABLE clientes');
  const showVentas = typedCode.includes('CREATE TABLE ventas');
  const showProductos = typedCode.includes('CREATE TABLE productos');
  const showCategorias = typedCode.includes('CREATE TABLE categorias');
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
      
      {/* Floating Decorative Elements (Desktop Only) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
        
        {/* Left Side: Users Table */}
        <motion.div 
          initial={{ opacity: 0, x: -50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
          transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.8 }, x: { duration: 0.8 } }}
          className="absolute top-[15%] left-0 xl:-left-[5%] bg-white rounded-xl shadow-2xl border border-slate-200 w-48 overflow-visible"
        >
           {/* SVG Connecting Line going right */}
           <svg className="absolute top-1/2 left-full w-32 h-32 pointer-events-none overflow-visible">
              <motion.path 
                d="M 0 0 C 60 0, 100 40, 150 40" 
                stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="5 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.5, delay: 1 }}
              />
              <motion.circle 
                r="3" fill="#3b82f6"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                animate={{ offsetDistance: ["0%", "100%"] } as any}
                transition={{ duration: 3, ease: "linear", repeat: Infinity, delay: 1.5 }}
                style={{ offsetPath: "path('M 0 0 C 60 0, 100 40, 150 40')" }}
              />
           </svg>

           <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 flex items-center gap-2 rounded-t-xl">
             <div className="w-2 h-2 rounded-full bg-blue-500" />
             <span className="text-xs font-bold text-blue-900">users</span>
           </div>
           <div className="p-3 text-[10px] font-mono text-slate-600 space-y-2 bg-white rounded-b-xl">
             <div className="flex justify-between items-center"><span>id</span> <span className="text-amber-500 font-bold bg-amber-50 px-1 rounded">PK</span></div>
             <div className="flex justify-between items-center"><span>email</span> <span className="text-slate-400">VARCHAR</span></div>
           </div>
           
           {/* Decorative code badge */}
           <motion.div 
             animate={{ rotate: [-6, -2, -6] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
             className="absolute -bottom-5 -right-6 bg-slate-900 text-emerald-400 text-[10px] font-mono px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 transform -rotate-6"
           >
              SELECT * FROM users
           </motion.div>
        </motion.div>

        {/* Right Side: Orders Table + Avatar */}
        <motion.div 
          initial={{ opacity: 0, x: 50, y: -50 }}
          animate={{ opacity: 1, x: 0, y: [0, 20, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.8, delay: 0.2 }, x: { duration: 0.8, delay: 0.2 } }}
          className="absolute top-[15%] right-0 xl:-right-[5%] bg-white rounded-xl shadow-2xl border border-slate-200 w-52 overflow-visible"
        >
           {/* SVG Connecting Line going left */}
           <svg className="absolute top-[40%] right-full w-32 h-32 pointer-events-none overflow-visible">
              <motion.path 
                d="M 0 0 C -60 0, -100 -50, -150 -50" 
                stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="5 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1.5, delay: 1.2 }}
              />
              <motion.circle 
                r="3" fill="#10b981"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                animate={{ offsetDistance: ["0%", "100%"] } as any}
                transition={{ duration: 3, ease: "linear", repeat: Infinity, delay: 1.7 }}
                style={{ offsetPath: "path('M 0 0 C -60 0, -100 -50, -150 -50')" }}
              />
           </svg>

           {/* Collaborative Avatar Badge */}
           <div className="absolute -top-5 -left-5 bg-white rounded-full shadow-xl p-1 flex items-center gap-2 border border-slate-100 transform -rotate-6 z-10">
             <div className="w-8 h-8 rounded-full bg-emerald-100 overflow-hidden border-2 border-white shadow-sm">
               <img src="https://i.pravatar.cc/150?u=carlos" alt="Carlos" className="w-full h-full object-cover" />
             </div>
             <div className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mr-1 flex items-center gap-1 shadow-md">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Editando
             </div>
           </div>

           <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 flex items-center gap-2 mt-2 rounded-t-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-xs font-bold text-emerald-900">orders</span>
           </div>
           <div className="p-3 text-[10px] font-mono text-slate-600 space-y-2 bg-white rounded-b-xl">
             <div className="flex justify-between items-center"><span>id</span> <span className="text-amber-500 font-bold bg-amber-50 px-1 rounded">PK</span></div>
             <div className="flex justify-between items-center relative">
               <span>user_id</span> <span className="text-emerald-500 font-bold bg-emerald-50 px-1 rounded">FK</span>
               <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399] animate-pulse" />
             </div>
             <div className="flex justify-between items-center"><span>total</span> <span className="text-slate-400">NUMERIC</span></div>
           </div>
        </motion.div>

        {/* Top Left small floating badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 4, repeat: Infinity }, scale: { duration: 0.5, delay: 0.5 } }}
          className="absolute top-[5%] left-[20%] bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-100"
        >
          <Database className="w-6 h-6 text-[#1A6CF6] opacity-80" />
        </motion.div>

      </div>

      {/* Top Illustration Placeholder */}
      <div className="relative w-full max-w-3xl mx-auto h-24 mb-8 flex justify-center items-end z-10">
        <div className="bg-white border-2 border-slate-800 shadow-[0_8px_0_0_#1e293b] hover:shadow-[0_4px_0_0_#1e293b] hover:translate-y-1 rounded-full px-8 py-3 flex items-center gap-3 transition-all cursor-pointer group">
          <span className="font-bold text-slate-800 tracking-wide">Generar diagramas</span>
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform">👉</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Diseña bases de datos <br className="hidden sm:block" />
          en equipo, <span className="text-[#1A6CF6]">en segundos.</span>
        </h1>

        <p className="text-slate-600 text-lg sm:text-xl mt-6 max-w-2xl">
          Convierte tu SQL en diagramas visuales en tiempo real. Colabora, exporta y optimiza sin instalar nada, todo en un solo clic.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1A6CF6]/20"
          >
            Empezar gratis
          </Link>
          <button className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-colors bg-white">
            Aprender más
          </button>
        </div>

        {/* DB Carousel (Marquee) */}
        <div className="mt-16 w-full max-w-5xl mx-auto overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10" />
          
          <div className="flex w-[200%] animate-[marquee_20s_linear_infinite]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-1 justify-around items-center opacity-40 grayscale gap-12 px-6">
                <span className="text-xl font-bold text-slate-800">PostgreSQL</span>
                <span className="text-xl font-bold text-slate-800">MongoDB</span>
                <span className="text-xl font-bold text-slate-800 font-serif">MySQL</span>
                <span className="text-xl font-bold text-slate-800">Cassandra</span>
                <span className="text-xl font-bold text-slate-800 font-mono">Redis</span>
                <span className="text-xl font-bold text-slate-800">Neo4j</span>
                <span className="text-xl font-bold text-slate-800 font-serif">SQL Server</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split-screen Interactive Demo Container */}
      <div className="mt-16 md:mt-20 w-full max-w-6xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl shadow-[#1A6CF6]/5 border-2 border-slate-200 flex flex-col md:flex-row h-[750px] md:h-[600px] text-left">
        
        {/* Left Panel: SQL Editor */}
        <div className={`w-full md:w-[40%] h-[400px] md:h-full flex flex-col transition-colors duration-300 border-b md:border-b-0 md:border-r border-slate-200 ${theme === 'dark' ? 'bg-[#060913]' : 'bg-white'}`}>
          <div className={`h-14 border-b flex items-center px-4 justify-between ${theme === 'dark' ? 'border-[#1E2A45] bg-[#0B1120]' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            <div className={`text-xs font-mono font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>schema.sql</div>

            {/* Theme Toggle */}
            <div className="flex bg-slate-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setTheme('light')} 
                className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Modo Claro"
              >
                <Sun size={14}/>
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-[#1E2A45] shadow-sm text-white' : 'text-slate-400 hover:text-slate-600'}`}
                title="Modo Oscuro"
              >
                <Moon size={14}/>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 relative">
            <textarea 
              value={typedCode}
              onChange={(e) => setTypedCode(e.target.value)}
              readOnly={isTyping}
              className={`w-full h-full bg-transparent text-[13px] font-mono focus:outline-none resize-none leading-relaxed transition-colors duration-300 ${theme === 'dark' ? 'text-emerald-400' : 'text-slate-800'}`}
              spellCheck="false"
            />
            {isTyping && (
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`absolute inline-block w-2 h-4 ml-1 ${theme === 'dark' ? 'bg-emerald-400' : 'bg-slate-800'}`}
                style={{
                  top: '1rem',
                  left: '1rem'
                }} // Simplified caret, actual positioning depends on textarea text length, but we show a static one conceptually or let native handle it.
              />
            )}
            
            {!isTyping && (
              <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t pointer-events-none flex items-end justify-center pb-4 ${theme === 'dark' ? 'from-[#060913] to-transparent' : 'from-white to-transparent'}`}>
                <span className={`text-xs px-3 py-1.5 rounded-full shadow-sm font-medium border ${theme === 'dark' ? 'bg-[#0F1A2E] text-slate-400 border-[#1E2A45]' : 'bg-white text-slate-600 border-slate-200'}`}>¡El código es editable! Haz la prueba 👇</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Canvas Diagram (Light Miro-Style) */}
        <div 
          ref={canvasRef}
          className={`w-full md:w-[60%] h-[350px] md:h-full relative overflow-hidden bg-slate-50 ${activeTool === 'comment' ? 'cursor-cell' : activeTool === 'hand' ? 'cursor-grab' : 'cursor-default'}`}
          onClick={handleCanvasClick}
        >
          {/* Toolbar */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-xl shadow-slate-200/50 rounded-xl flex flex-col p-1.5 gap-1 border border-slate-200 z-50">
            <button onClick={() => setActiveTool('cursor')} className={`p-2.5 rounded-lg transition-colors ${activeTool === 'cursor' ? 'bg-slate-100 text-[#1A6CF6]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Seleccionar">
              <MousePointer2 size={18} className={activeTool === 'cursor' ? 'fill-current' : ''}/>
            </button>
            <button onClick={() => setActiveTool('hand')} className={`p-2.5 rounded-lg transition-colors ${activeTool === 'hand' ? 'bg-slate-100 text-[#1A6CF6]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Mover lienzo">
              <Hand size={18} className={activeTool === 'hand' ? 'fill-current' : ''} />
            </button>
            <div className="w-8 mx-auto border-b border-slate-200 my-1"></div>
            <button onClick={() => setActiveTool('comment')} className={`p-2.5 rounded-lg transition-colors ${activeTool === 'comment' ? 'bg-slate-100 text-[#1A6CF6]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Añadir nota">
              <MessageSquarePlus size={18} className={activeTool === 'comment' ? 'fill-current' : ''} />
            </button>
          </div>

          {!mounted && (
            <div className="w-full h-full bg-slate-50" />
          )}

          {/* Actual Nodes & SVG when mounted */}
          {mounted && (
            <div className="w-[800px] h-[600px] relative origin-top-left scale-[0.45] sm:scale-[0.6] md:scale-75 lg:scale-90 xl:scale-100 transition-transform">
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrowhead-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
                  </marker>
                </defs>
                
                {showClientes && showVentas && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d="M 220 120 Q 300 120 320 200" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-gray)" 
                  />
                )}
                
                {showProductos && showVentas && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d="M 220 380 Q 300 380 320 300" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-gray)" 
                  />
                )}
                
                {showCategorias && showProductos && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d="M 100 480 Q 100 440 120 420" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-gray)" 
                  />
                )}
              </svg>

              <AnimatePresence>
                {/* Node 1: clientes */}
                {showClientes && (
                  <motion.div 
                    key="node-clientes"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute top-10 left-16 bg-white border border-slate-300 rounded-xl w-48 shadow-lg overflow-hidden z-10"
                  >
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">clientes</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> nombre <span className="text-slate-400">VARCHAR</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> email <span className="text-slate-400">VARCHAR</span></div>
                    </div>
                  </motion.div>
                )}

                {/* Node 2: ventas */}
                {showVentas && (
                  <motion.div 
                    key="node-ventas"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute top-[30%] right-12 bg-white border border-slate-300 rounded-xl w-52 shadow-xl z-10 overflow-hidden"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1A6CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md">Alejandro</div>
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-slate-800">ventas</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">🔗</span> cliente_id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">🔗</span> producto_id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> total <span className="text-slate-400">NUMERIC</span></div>
                    </div>
                  </motion.div>
                )}

                {/* Node 3: productos */}
                {showProductos && (
                  <motion.div 
                    key="node-productos"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute bottom-32 left-16 bg-white border border-slate-300 rounded-xl w-48 shadow-lg overflow-hidden z-10"
                  >
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">productos</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> nombre <span className="text-slate-400">VARCHAR</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> precio <span className="text-slate-400">NUMERIC</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">🔗</span> categoria_id <span className="text-slate-400">UUID</span></div>
                    </div>
                  </motion.div>
                )}

                {/* Node 4: categorias */}
                {showCategorias && (
                  <motion.div 
                    key="node-categorias"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute bottom-4 left-4 bg-white border border-slate-300 rounded-xl w-44 shadow-lg overflow-hidden z-10"
                  >
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">categorias</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> nombre <span className="text-slate-400">VARCHAR</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sticky Notes */}
              {notes.map(note => (
                <motion.div 
                  key={note.id} 
                  initial={{ scale: 0, rotate: -5 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  className="absolute bg-[#FFEAA7] text-amber-900 p-3 rounded-lg shadow-md font-medium w-40 z-30 cursor-text" 
                  style={{ left: note.x, top: note.y }}
                  onClick={(e) => e.stopPropagation()} // Prevent adding another note when clicking inside
                >
                  <textarea 
                    value={note.text} 
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    placeholder="Escribe algo..."
                    className="bg-transparent border-none outline-none w-full h-16 resize-none text-sm placeholder-amber-900/50 leading-tight" 
                    autoFocus
                  />
                  {/* Decorative pin or fold */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-l-8 border-t-amber-200 border-l-transparent opacity-60"></div>
                </motion.div>
              ))}

              {/* Decorative Cursors mapping from Miro style */}
              <div className="absolute top-[20%] left-[45%] flex flex-col items-center animate-bounce z-20 pointer-events-none">
                <div className="bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Mae</div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#7C3AED] transform -translate-y-0.5"></div>
              </div>
              <div className="absolute bottom-[20%] right-[15%] flex flex-col items-center animate-pulse z-20 pointer-events-none" style={{ animationDuration: '3s' }}>
                <div className="bg-[#F59E0B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Matt</div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#F59E0B] transform -translate-y-0.5"></div>
              </div>

            </div>
          )}
        </div>
      </div>
    </section>
  );
}
