import React, { useState } from 'react';
import { Equipment, TechnicianLog, FinalConditionType } from '../types';
import { Printer, X, Save } from 'lucide-react';

interface WorkOrderProps {
  item: Equipment;
  isInteractive?: boolean;
  technicianName?: string;
  onClose?: () => void;
  onPrint?: () => void;
  onSaveJob?: (logs: TechnicianLog[], condition: FinalConditionType) => void;
}

const WorkOrder: React.FC<WorkOrderProps> = ({
  item,
  isInteractive = false,
  technicianName,
  onClose,
  onPrint,
  onSaveJob
}) => {
  const [logs, setLogs] = useState<TechnicianLog[]>(item.technicianLogs || []);
  const [newLog, setNewLog] = useState('');
  const [condition, setCondition] = useState<FinalConditionType>(item.finalCondition || null);

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

  const addLog = () => {
    if (newLog.trim()) {
      const logEntry: TechnicianLog = {
        date: new Date().toISOString(),
        technician: technicianName || 'Technician',
        action: newLog.trim()
      };
      setLogs([...logs, logEntry]);
      setNewLog('');
    }
  };

  const handleSave = () => {
    if (onSaveJob && condition) {
      onSaveJob(logs, condition);
    }
  };

  const coatOfArmsPath = '/bulawayo-coat-of-arms.png';

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden w-full max-w-6xl">
      {/* Header with logo */}
      <div className="bg-gradient-to-r from-[#006097] to-[#0088cc] p-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-white p-3 rounded-2xl shadow-lg">
            <img
              src={coatOfArmsPath}
              alt="City Logo"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-xs">LOGO</div>';
              }}
            />
          </div>

          <div className="text-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">City of Bulawayo</h1>
            <p className="text-lg opacity-90 mt-1 font-medium">Information Communication Technology Department</p>
            <div className="flex gap-6 mt-3 text-sm">
              <span className="bg-white/20 px-4 py-1 rounded-full">COBICT</span>
              <span className="bg-white/20 px-4 py-1 rounded-full">Equipment Workshop</span>
            </div>
          </div>
        </div>

        <div className="text-right text-white">
          <div className="text-4xl font-black">{item.jobCardNo}</div>
          <div className="text-sm opacity-80 mt-2">Job Card Number</div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pb-10">
        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Equipment Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial Number</p>
                <p className="text-2xl font-black text-gray-900 mt-2">{item.serialNumber}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment Type</p>
                <p className="text-2xl font-black text-gray-900 mt-2">{item.type}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Office Location</p>
                <p className="text-2xl font-black text-gray-900 mt-2">{item.officeNumber}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Staff</p>
                <p className="text-2xl font-black text-gray-900 mt-2">{item.assignedTo}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Issue Description</p>
              <p className="text-lg font-bold text-gray-900 whitespace-pre-wrap">{item.notes || 'No detailed description provided.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OS / Firmware</p>
                <p className="text-lg font-black text-gray-900 mt-2">{item.osFirmware}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</p>
                <div className={`text-lg font-black mt-2 ${item.priority === 'High' ? 'text-red-600' : item.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {item.priority}
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                <div className={`text-lg font-black mt-2 ${item.status === 'Pending' ? 'text-amber-600' : 'text-green-600'}`}>
                  {item.status}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Technician Section */}
          <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Workshop Dates</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-blue-800 font-bold">Received</p>
                  <p className="text-xl font-black text-blue-900">{formatDate(item.receivedDate)}</p>
                </div>
                {item.fixedDate && (
                  <div>
                    <p className="text-xs text-blue-800 font-bold">Completed</p>
                    <p className="text-xl font-black text-blue-900">{formatDate(item.fixedDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {isInteractive && technicianName && (
              <div className="bg-amber-50 p-6 rounded-2xl">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Technician Log</p>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLog}
                      onChange={(e) => setNewLog(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addLog()}
                      placeholder="Add repair note..."
                      className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button onClick={addLog} aria-label="Save log" className="bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors">
                      <Save size={18} />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {logs.map((log, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100">
                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatDate(log.date)} • {log.technician}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Final Condition</p>
                    <div className="flex flex-wrap gap-2">
                      {(['Working', 'Partially', 'Dead'] as FinalConditionType[]).map(opt => (
                        <button
                          key={opt || 'null'}
                          onClick={() => setCondition(opt)}
                          className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase rounded-xl transition-all ${condition === opt ? 'bg-amber-600 text-white' : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'}`}
                        >
                          {opt || 'N/A'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {condition && logs.length > 0 && (
                    <button
                      onClick={handleSave}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-green-700 transition-colors mt-4"
                    >
                      Save Job Details
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 p-8 flex justify-between items-center">
        <div className="text-white">
          <p className="text-sm opacity-80">Logged by: <span className="font-bold">{item.loggedBy}</span></p>
          <p className="text-xs opacity-60 mt-1">System generated work order • Do not discard</p>
        </div>

        <div className="flex gap-4">
          {onClose && (
            <button onClick={onClose} aria-label="Close modal" className="bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors">
              Close
            </button>
          )}
          {onPrint && (
            <button onClick={onPrint} aria-label="Print work order" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Printer size={18} /> Print Work Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrder;