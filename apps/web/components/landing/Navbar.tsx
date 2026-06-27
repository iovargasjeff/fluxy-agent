'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <Database className="w-6 h-6 text-[#1A6CF6]" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">Fluxy</span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#producto" className="text-slate-600 hover:text-slate-900 transition-colors">Producto</Link>
          <Link href="#caracteristicas" className="text-slate-600 hover:text-slate-900 transition-colors">Características</Link>
          <Link href="#precios" className="text-slate-600 hover:text-slate-900 transition-colors">Precios</Link>
          <Link href="#docs" className="text-slate-600 hover:text-slate-900 transition-colors">Docs</Link>
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link 
            href="/register" 
            className="bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -mr-2 text-slate-600 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl md:hidden flex flex-col px-6 py-6 gap-6"
          >
            <div className="flex flex-col gap-4 text-base font-semibold">
              <Link href="#producto" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-[#1A6CF6]">Producto</Link>
              <Link href="#caracteristicas" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-[#1A6CF6]">Características</Link>
              <Link href="#precios" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-[#1A6CF6]">Precios</Link>
              <Link href="#docs" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-[#1A6CF6]">Docs</Link>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex flex-col gap-3">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#1A6CF6] text-white rounded-xl font-bold hover:bg-[#1557d4] transition-colors"
              >
                Empezar gratis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
