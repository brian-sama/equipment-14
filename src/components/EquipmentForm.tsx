import React, { useState } from 'react';
import { X, Save, Box } from 'lucide-react';
import { UserType, PriorityType } from '../types';

interface EquipmentFormProps {
  currentUser: UserType;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ currentUser, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'Laptop',
    serialNumber: '',
    officeNumber: '',
    assignedTo: '',
    priority: 'Medium' as PriorityType,
    osFirmware: 'Windows 10',
    notes: '',
    receivedDate: new Date().toISOString().split('T')[0],
    srNumber: '',
    owner: ''
  });
  const [isFetching, setIsFetching] = useState(false);

  const handleSerialBlur = async () => {
    if (!formData.serialNumber) return;

    setIsFetching(true);
    try {
      // Replace with your actual inventory app URL
      const response = await fetch(`https://your-inventory-app.netlify.app/api/external/asset/${formData.serialNumber}`, {
        headers: { 'x-api-key': 'BCC_REPAIRS_SYNC_2024' }
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          srNumber: data.srNumber || '',
          owner: data.owner || ''
        }));
      }
    } catch (error) {
      console.warn("Failed to fetch asset details:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const types = ['Laptop', 'Printer', 'PC', 'Monitor', 'Phone', 'Server', 'Other'];
  const priorities: PriorityType[] = ['Low', 'Medium', 'High'];
  const osOptions = ['Windows 11', 'Windows 10', 'Windows 8.1', 'Windows 8', 'Windows 7', 'Linux', 'macOS', 'Android', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serialNumber || !formData.officeNumber || !formData.assignedTo) {
      alert("All fields marked with * are required.");
      return;
    }

    const submissionData = {
      ...formData,
      receivedDate: new Date().toISOString(), // Use ISO string for Supabase
      status: 'Pending',
      jobCardNo: `COMETZ${new Date().getFullYear()}/${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(submissionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-in">
        <div className="bg-[#006097] px-10 py-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Job Entry</h2>
            <p className="text-xs opacity-80 mt-1 uppercase font-bold tracking-widest">Reception Desk Log</p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto pb-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Device Category *</label>
              <select
                aria-label="Device Category"
                title="Select Device Category"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Priority Level *</label>
              <div className="flex gap-2">
                {priorities.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all border ${formData.priority === p ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Serial Number *</label>
              <input
                type="text" required placeholder="S/N..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                onBlur={handleSerialBlur}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">OS / Firmware *</label>
              <select
                aria-label="OS / Firmware"
                title="Select OS / Firmware"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.osFirmware}
                onChange={(e) => setFormData({ ...formData, osFirmware: e.target.value })}
              >
                {osOptions.map(os => <option key={os} value={os}>{os}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Office Location *</label>
              <input
                type="text" required placeholder="Room 402"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.officeNumber}
                onChange={(e) => setFormData({ ...formData, officeNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Assigned Staff *</label>
              <input
                type="text" required placeholder="User Name"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Detailed Issue</label>
            <textarea
              rows={3} placeholder="Describe the fault..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="col-span-2">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Inventory Details (Auto-fetched)</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">SR Number</label>
              <input
                type="text" placeholder="Auto-filled..."
                readOnly
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none text-gray-500 cursor-not-allowed"
                value={formData.srNumber}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Registered Owner</label>
              <input
                type="text" placeholder="Auto-filled..."
                readOnly
                className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-sm outline-none text-gray-500 cursor-not-allowed"
                value={formData.owner}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="text-blue-600" size={20} />
              <div>
                <span className="text-[10px] font-black text-blue-900 uppercase block">Logger Identity: <span className="underline">{currentUser}</span></span>
                <span className="text-[9px] text-blue-700 font-medium">Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <button type="submit" className="bg-[#006097] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-[1.02] transition-transform flex items-center gap-2">
              <Save size={16} /> Generate Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;