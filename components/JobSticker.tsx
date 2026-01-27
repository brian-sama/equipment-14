import React from 'react';
import { Equipment } from '../types';

interface JobStickerProps {
  item: Equipment;
}

const JobSticker: React.FC<JobStickerProps> = ({ item }) => {
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Use absolute path for Netlify
  const logoPath = '/bulawayo-coat-of-arms.png';

  return (
    <div className="p-6 border-4 border-blue-600 rounded-[30px] w-[400px] bg-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoPath}
            alt="City Logo" 
            className="w-12 h-12 object-contain"
            onError={(e) => {
              console.error("Failed to load image:", logoPath);
              // Fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">LOGO</div>';
            }}
          />
          <div>
            <div className="text-xs font-black text-blue-900 uppercase tracking-tight">City of Bulawayo</div>
            <div className="text-[10px] text-gray-500 font-bold">ICT Workshop</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-blue-700">{item.jobCardNo}</div>
          <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Job Card</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-xl">
          <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Serial No</div>
          <div className="text-lg font-black text-gray-900 truncate">{item.serialNumber}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Type</div>
          <div className="text-lg font-black text-gray-900">{item.type}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Office</div>
          <div className="text-lg font-black text-gray-900">{item.officeNumber}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Date</div>
          <div className="text-lg font-black text-gray-900">{formatDate(item.receivedDate)}</div>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-3 rounded-xl mb-3">
        <div className="text-[8px] font-black uppercase tracking-widest opacity-80">Assigned To</div>
        <div className="text-sm font-black">{item.assignedTo}</div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-[8px] text-gray-400 font-bold">
          COBICT Equipment Tracker • v1.0
        </div>
        <div className="text-[8px] font-black text-blue-700 uppercase tracking-widest">
          Scan for updates
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <div className="text-[7px] text-gray-500 font-bold">
          Keep this sticker attached to the equipment at all times
        </div>
      </div>
    </div>
  );
};

export default JobSticker;