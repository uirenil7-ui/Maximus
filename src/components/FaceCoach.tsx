import React from 'react';
import { motion } from 'motion/react';

export default function FaceCoach({ guideTitle }: { guideTitle: string }) {
  return (
    <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden group">
       {/* High-end medical scanner background grid */}
       <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:32px_32px]" />
       
       <motion.div 
         animate={{ rotateY: [-5, 5, -5], y: [0, -5, 0] }}
         transition={{ 
            rotateY: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
         }}
         className="relative w-64 h-80 flex flex-col items-center justify-center z-10"
         style={{ transformStyle: 'preserve-3d' }}
       >
          {/* Base Realistic Face image with masking and blending */}
          <div className="absolute inset-0 w-full h-full rounded-[40%] overflow-hidden bg-ios-blue/10 border-4 border-ios-blue/20 shadow-[0_0_50px_rgba(10,132,255,0.15)] flex items-center justify-center">
             <img 
               src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
               alt="Aesthetic Model"
               className="w-full h-full object-cover mix-blend-luminosity opacity-80"
             />
             <div className="absolute inset-0 bg-blue-500 mix-blend-overlay opacity-30" />
             <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-900/40 to-[#050505]" />
          </div>

          {/* AR Wireframe overlay */}
          <svg viewBox="0 0 200 280" className="absolute w-full h-full drop-shadow-[0_0_15px_rgba(10,132,255,0.5)] z-20 pointer-events-none mix-blend-screen opacity-60">
            <defs>
              <filter id="neonBlur">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M100 20 L100 260 M40 90 L160 90 M45 150 L155 150 M70 230 L130 230 M60 50 L140 50" stroke="rgba(10,132,255,0.8)" strokeWidth="0.5" strokeDasharray="2 4" filter="url(#neonBlur)"/>
            {/* Eye tracking squares */}
            <rect x="65" y="105" width="20" height="15" fill="none" stroke="rgba(52, 199, 89, 0.8)" strokeWidth="1" filter="url(#neonBlur)" />
            <rect x="115" y="105" width="20" height="15" fill="none" stroke="rgba(52, 199, 89, 0.8)" strokeWidth="1" filter="url(#neonBlur)" />
            {/* Geometric points */}
            <circle cx="100" cy="180" r="2" fill="white" />
            <circle cx="75" cy="230" r="2" fill="white" />
            <circle cx="125" cy="230" r="2" fill="white" />
          </svg>

          {/* Scanning Line Animation */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-1 bg-ios-blue/80 shadow-[0_0_20px_rgba(10,132,255,1)] z-30"
          />

          <Animations guideTitle={guideTitle} />
       </motion.div>
       
       <div className="absolute bottom-4 left-0 right-0 text-center text-ios-blue border border-ios-blue/30 bg-ios-blue/5 py-2 mx-8 rounded-full font-mono text-[9px] uppercase tracking-[0.3em] font-black backdrop-blur-sm shadow-[0_0_10px_rgba(10,132,255,0.2)] z-40">
         AR Biometric Sync Active
       </div>
    </div>
  )
}

function Animations({ guideTitle }: { guideTitle: string }) {
   if (guideTitle.includes('Jawline')) {
     return (
       <>
         {/* Left sweep */}
         <motion.div 
            initial={{ top: '90%', left: '45%' }}
            animate={{ top: '45%', left: '-5%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white] z-30"
         />
         {/* Right sweep */}
         <motion.div 
            initial={{ top: '90%', left: '45%' }}
            animate={{ top: '45%', left: '95%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-6 h-6 bg-white rounded-full blur-[2px] shadow-[0_0_20px_white] z-30"
         />
       </>
     )
   }
   if (guideTitle.includes('Gua Sha') || guideTitle.includes('Lift')) {
      return (
         <>
           <motion.div 
              initial={{ top: '60%', right: '10%' }}
              animate={{ top: '25%', right: '-5%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-12 h-3 bg-ios-green rounded-full blur-[1px] -rotate-45 shadow-[0_0_15px_rgba(48,209,88,0.8)] z-30"
           />
           <motion.div 
              initial={{ top: '60%', left: '10%' }}
              animate={{ top: '25%', left: '-5%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-12 h-3 bg-ios-green rounded-full blur-[1px] rotate-45 shadow-[0_0_15px_rgba(48,209,88,0.8)] z-30"
           />
         </>
      )
   }
   // Eye Symmetry or default
   return (
      <>
         {/* Eye push */}
         <motion.div 
            initial={{ top: '33%', left: '40%' }}
            animate={{ left: '10%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-5 h-5 bg-ios-orange rounded-full blur-[2px] shadow-[0_0_15px_rgba(255,159,10,0.8)] z-30"
         />
         <motion.div 
            initial={{ top: '33%', right: '40%' }}
            animate={{ right: '10%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-5 h-5 bg-ios-orange rounded-full blur-[2px] shadow-[0_0_15px_rgba(255,159,10,0.8)] z-30"
         />
      </>
   )
}
