import React, { useState, useMemo, useEffect } from 'react';
import { UserType, Equipment, TabType, EquipmentStatus, TechnicianLog, FinalConditionType } from '../types';
import { Search, Plus, Box, CheckCircle2, Package, LogOut, RefreshCw, Bell, AlertTriangle, Filter } from 'lucide-react';
import EquipmentCard from './EquipmentCard';
import EquipmentForm from './EquipmentForm';
import WorkOrder from './WorkOrder';
import JobSticker from './JobSticker';

interface DashboardProps {
  user: UserType;
  items: Equipment[];
  onLogout: () => void;
  onAddItem: (item: any) => void;
  onMarkFixed: (id: string) => void;
  onUpdateJob: (id: string, logs: TechnicianLog[], condition: FinalConditionType) => Promise<boolean>;
  onRefresh: () => void;
  isLoading: boolean;
}

// Date formatting utility
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

const Dashboard: React.FC<DashboardProps> = ({ user, items, onLogout, onAddItem, onMarkFixed, onUpdateJob, onRefresh, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All Categories');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [printItem, setPrintItem] = useState<{item: Equipment, type: 'card' | 'sticker'} | null>(null);
  const [viewItemId, setViewItemId] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const categories = useMemo(() => {
    const types = Array.from(new Set(items.map(item => item.type)));
    return ['All Categories', ...types.sort()];
  }, [items]);

  useEffect(() => {
    const handleAfterPrint = () => setPrintItem(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const calculateDaysInWorkshop = (receivedDate: string | null | undefined) => {
    if (!receivedDate) return 0;
    
    try {
      const start = new Date(receivedDate);
      if (isNaN(start.getTime())) return 0;
      
      const today = new Date();
      const diff = today.getTime() - start.getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  };

  const overstayedItems = useMemo(() => {
    return items.filter(i => 
      i.status === EquipmentStatus.PENDING && 
      calculateDaysInWorkshop(i.receivedDate) >= 2
    );
  }, [items]);

  const viewItem = useMemo(() => {
    return items.find(i => i.id === viewItemId) || null;
  }, [items, viewItemId]);

  const stats = useMemo(() => ({
    all: items.length,
    received: items.filter(i => i.status === EquipmentStatus.PENDING).length,
    fixed: items.filter(i => i.status === EquipmentStatus.FIXED).length,
  }), [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeTab === 'Received') result = result.filter(i => i.status === EquipmentStatus.PENDING);
    else if (activeTab === 'Fixed') result = result.filter(i => i.status === EquipmentStatus.FIXED);
    if (selectedType !== 'All Categories') result = result.filter(i => i.type === selectedType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.serialNumber?.toLowerCase().includes(q) ||
        i.officeNumber?.toLowerCase().includes(q) ||
        i.jobCardNo?.toLowerCase().includes(q) ||
        i.assignedTo?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeTab, searchQuery, selectedType]);

  const handlePrint = (item: Equipment, type: 'card' | 'sticker') => {
    setPrintItem({ item, type });
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div id="print-section" className="hidden">
        {printItem?.type === 'card' && <WorkOrder item={printItem.item} />}
        {printItem?.type === 'sticker' && <JobSticker item={printItem.item} />}
      </div>

      {viewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <WorkOrder 
            item={viewItem} 
            isInteractive={true} 
            technicianName={user}
            onClose={() => setViewItemId(null)}
            onPrint={() => handlePrint(viewItem, 'card')}
            onSaveJob={(logs, condition) => onUpdateJob(viewItem.id, logs, condition)}
          />
        </div>
      )}

      {showAlertModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slide-in">
            <div className="bg-red-600 p-6 text-white flex items-center gap-3">
              <AlertTriangle size={32} />
              <div><h3 className="text-xl font-bold">Workshop Overstay</h3><p className="text-xs opacity-90">Pending for 48h+</p></div>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3">
              {overstayedItems.map(item => (
                <div key={item.id} className="p-4 bg-red-50 border border-red-100 rounded-xl flex justify-between">
                  <div><p className="font-bold text-gray-900 text-sm">{item.serialNumber}</p><p className="text-[10px] text-red-600 font-bold uppercase">{item.jobCardNo}</p></div>
                  <p className="text-xs font-black text-red-700">{calculateDaysInWorkshop(item.receivedDate)}D Late</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t"><button onClick={() => setShowAlertModal(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest">Acknowledge</button></div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#006097] p-2 rounded-lg"><Box className="text-white" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Equipment Tracker</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">COBICT REPAIR Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user === 'Admin' && (
              <button 
                onClick={() => setShowAlertModal(true)} 
                className={`relative p-2 rounded-xl transition-all ${overstayedItems.length > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}
              >
                <Bell size={22} fill={overstayedItems.length > 0 ? 'currentColor' : 'none'} />
                {overstayedItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{overstayedItems.length}</span>}
              </button>
            )}
            <button onClick={onRefresh} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} /></button>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Session</p>
              <p className="text-sm font-black text-gray-900">{user}</p>
            </div>
            <button onClick={onLogout} className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-colors"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
            <div><p className="text-3xl font-black text-gray-900 leading-none">{stats.all}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Total Inventory</p></div>
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Package size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
            <div><p className="text-3xl font-black text-gray-900 leading-none">{stats.received}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Pending Repair</p></div>
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><Box size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
            <div><p className="text-3xl font-black text-gray-900 leading-none">{stats.fixed}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Closed Jobs</p></div>
            <div className="bg-green-50 p-4 rounded-2xl text-green-600"><CheckCircle2 size={24} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col xl:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search S/N, Job #, or Staff..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm appearance-none cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto bg-[#006097] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
              <Plus size={18} /> New Entry
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {(['All', 'Received', 'Fixed'] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${activeTab === tab ? 'bg-[#006097] text-white border-[#006097]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <EquipmentCard 
                key={item.id} 
                item={item} 
                onMarkFixed={onMarkFixed}
                onPrintSticker={() => handlePrint(item, 'sticker')}
                onView={() => setViewItemId(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center animate-slide-in">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">System Ready</h3>
            <p className="text-gray-400 text-sm mt-1">No items match your active filters.</p>
          </div>
        )}
      </main>

      {isFormOpen && <EquipmentForm currentUser={user} onClose={() => setIsFormOpen(false)} onSubmit={onAddItem} />}
    </div>
  );
};

export default Dashboard;