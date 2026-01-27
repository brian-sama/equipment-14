
import React from 'react';
import { Equipment, EquipmentStatus } from '../types';
import { MapPin, Calendar, CheckCircle, Printer, HardDrive, Eye } from 'lucide-react';

interface EquipmentCardProps {
  item: Equipment;
  onMarkFixed: (id: string) => void;
  onPrintSticker: () => void;
  onView: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, onMarkFixed, onPrintSticker, onView }) => {
  const isPending = item.status === EquipmentStatus.PENDING;
  const priorityStyles = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-blue-500' };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 animate-slide-in relative">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white ${priorityStyles[item.priority]}`}>
                {item.priority}
              </span>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.type}</p>
            </div>
            <h4 className="text-lg font-black text-gray-900 leading-tight">{item.serialNumber}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.jobCardNo}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
               isPending ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
             }`}>
               {item.status}
             </span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Location</p>
                <p className="text-xs font-bold text-gray-800">{item.officeNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><HardDrive size={16} /></div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">OS/FW</p>
                <p className="text-xs font-bold text-gray-800 truncate">{item.osFirmware || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Calendar size={16} /></div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">In / Out</p>
              <p className="text-xs font-bold text-gray-800">
                {new Date(item.receivedDate).toLocaleDateString()}
                {item.fixedDate && ` → ${new Date(item.fixedDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
        <button 
          onClick={onView}
          className="bg-white hover:bg-blue-600 hover:text-white text-gray-700 border border-gray-200 p-3 rounded-2xl transition-all"
          title="View & Log Maintenance"
        >
          <Eye size={18} />
        </button>
        <button 
          onClick={onPrintSticker}
          className="bg-white hover:bg-[#006097] hover:text-white text-gray-700 border border-gray-200 p-3 rounded-2xl transition-all"
          title="Print Equipment Sticker"
        >
          <Printer size={18} />
        </button>
        {isPending && (
          <button 
            onClick={() => onMarkFixed(item.id)}
            className="flex-1 bg-[#006097] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-50 hover:bg-[#004e7a] transition-all flex items-center justify-center gap-2"
          >
            <span>Close Job</span>
            <CheckCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EquipmentCard;
