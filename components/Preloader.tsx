
import React from 'react';
import { Box } from 'lucide-react';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 border-2 border-blue-100 rounded-full animate-pulse-ring"></div>
        <div className="absolute w-32 h-32 border-2 border-blue-50 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
        
        <div className="bg-[#006097] p-5 rounded-3xl shadow-2xl shadow-blue-200 z-10 animate-logo-spin">
          <Box size={40} className="text-white" />
        </div>
      </div>
      
      <div className="mt-10 text-center">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">COBICT REPAIR</h2>
        <div className="flex items-center gap-1 justify-center mt-2">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-6">Secure Connection Initializing</p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center">
        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Version 2.1.5 Premium</p>
      </div>
    </div>
  );
};

export default Preloader;
