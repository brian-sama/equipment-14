import React, { useState, useEffect, useCallback } from 'react';
import { UserType, Equipment, EquipmentStatus, PriorityType, TechnicianLog, FinalConditionType } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Preloader from './components/Preloader';
import { supabase } from './supabaseClient';

// Date formatting utility
const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sync Queue Logic
  const getSyncQueue = () => JSON.parse(localStorage.getItem('sync_queue') || '[]');
  const setSyncQueue = (queue: any[]) => localStorage.setItem('sync_queue', JSON.stringify(queue));

  const addToSyncQueue = (action: 'ADD' | 'UPDATE' | 'FIX', payload: any) => {
    const queue = getSyncQueue();
    queue.push({ id: crypto.randomUUID(), action, payload });
    setSyncQueue(queue);
    console.log(`Task added to sync queue: ${action}`, payload);
  };

  const processSyncQueue = useCallback(async (shouldFetch: boolean = true) => {
    if (!navigator.onLine) return;
    const queue = getSyncQueue();
    if (queue.length === 0) {
      if (shouldFetch) await fetchItems(false, true);
      return;
    }

    setLoading(true);
    let currentQueue = [...queue];

    for (const task of queue) {
      try {
        let error = null;
        if (task.action === 'ADD') {
          const { error: err } = await supabase.from('equipment').insert([task.payload]);
          error = err;
        } else if (task.action === 'UPDATE') {
          const { error: err } = await supabase.from('equipment')
            .update({
              technician_logs: task.payload.logs,
              final_condition: task.payload.condition,
              updated_at: new Date().toISOString()
            })
            .eq('id', task.payload.id);
          error = err;
        } else if (task.action === 'FIX') {
          const { error: err } = await supabase.from('equipment')
            .update({
              status: EquipmentStatus.FIXED,
              fixed_date: task.payload.date || new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', task.payload.id);
          error = err;
        }

        if (error) {
          console.error(`Sync task ${task.action} failed for ID ${task.payload.id || task.payload.job_card_no}:`, error);
          if (task.action === 'ADD' && (error as any).code === '23505') {
            console.log("Item already exists in database, clearing from queue");
          } else {
            console.warn("Stopping sync queue processing due to error.");
            break;
          }
        }

        currentQueue = currentQueue.filter(t => t.id !== task.id);
        setSyncQueue(currentQueue);
      } catch (err) {
        console.error("Sync task failed with exception:", err);
        break;
      }
    }

    if (shouldFetch) await fetchItems(false, true);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Process queue on mount if online
    if (navigator.onLine) {
      processSyncQueue();
    }

    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processSyncQueue]);

  const fetchItems = useCallback(async (isFirstLoad: boolean = false, skipSync: boolean = false) => {
    if (!isFirstLoad) setLoading(true);

    // If online and not skipped, process queue first
    if (navigator.onLine && !isFirstLoad && !skipSync) {
      await processSyncQueue(false);
    }

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('received_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedData: Equipment[] = data.map((item: any) => {
          // Ensure all dates are properly formatted
          const receivedDate = item.received_date ? new Date(item.received_date).toISOString() : new Date().toISOString();
          const fixedDate = item.fixed_date ? new Date(item.fixed_date).toISOString() : null;

          return {
            id: item.id,
            jobCardNo: item.job_card_no || 'N/A',
            type: item.type || 'N/A',
            serialNumber: item.serial_number || 'N/A',
            officeNumber: item.office_number || 'N/A',
            assignedTo: item.assigned_to || 'N/A',
            loggedBy: item.logged_by as UserType || 'Admin',
            receivedDate: receivedDate,
            formattedReceivedDate: formatDateForDisplay(receivedDate),
            fixedDate: fixedDate,
            formattedFixedDate: formatDateForDisplay(fixedDate),
            status: item.status as EquipmentStatus || EquipmentStatus.PENDING,
            priority: (item.priority as PriorityType) || 'Medium',
            osFirmware: item.os_firmware || 'N/A',
            notes: item.notes || '',
            technicianLogs: Array.isArray(item.technician_logs) ? item.technician_logs : [],
            finalCondition: item.final_condition as FinalConditionType || null,
            srNumber: item.sr_number || '',
            owner: item.owner || ''
          };
        });
        setItems(mappedData);
        localStorage.setItem('cached_items', JSON.stringify(mappedData));
      }
    } catch (err) {
      console.error("Fetch error, using cache:", err);
      const cached = localStorage.getItem('cached_items');
      if (cached) {
        try {
          setItems(JSON.parse(cached));
        } catch (parseError) {
          console.error("Cache parse error:", parseError);
        }
      }
    } finally {
      setLoading(false);
      if (isFirstLoad) setTimeout(() => setIsInitializing(false), 1500);
    }
  }, []);

  useEffect(() => {
    fetchItems(true);
  }, [fetchItems]);

  const handleLogin = (user: UserType) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  const addItem = async (newItem: Omit<Equipment, 'id' | 'loggedBy' | 'receivedDate' | 'status' | 'jobCardNo' | 'technicianLogs' | 'formattedReceivedDate' | 'formattedFixedDate'>) => {
    if (!currentUser) return;
    setLoading(true);

    const count = items.length;
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const jobCardNo = `COMETZ${currentYear}/${String(count + 1).padStart(5, '0')}`;
    const tempId = crypto.randomUUID();
    const receivedDate = new Date().toISOString();

    const payload = {
      id: tempId,
      job_card_no: jobCardNo,
      type: newItem.type,
      serial_number: newItem.serialNumber,
      office_number: newItem.officeNumber,
      assigned_to: newItem.assignedTo,
      logged_by: currentUser,
      status: EquipmentStatus.PENDING,
      priority: newItem.priority,
      os_firmware: newItem.osFirmware,
      notes: newItem.notes,
      technician_logs: [],
      final_condition: null,
      received_date: receivedDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sr_number: newItem.srNumber,
      owner: newItem.owner
    };

    // Optimistic Update with formatted dates
    const optimisticItem: Equipment = {
      id: tempId,
      jobCardNo: jobCardNo,
      type: newItem.type,
      serialNumber: newItem.serialNumber,
      officeNumber: newItem.officeNumber,
      assignedTo: newItem.assignedTo,
      loggedBy: currentUser,
      receivedDate: receivedDate,
      formattedReceivedDate: formatDateForDisplay(receivedDate),
      fixedDate: null,
      formattedFixedDate: 'N/A',
      status: EquipmentStatus.PENDING,
      priority: newItem.priority,
      osFirmware: newItem.osFirmware,
      notes: newItem.notes,
      technicianLogs: [],
      finalCondition: null,
      srNumber: newItem.srNumber,
      owner: newItem.owner
    };

    setItems([optimisticItem, ...items]);

    if (navigator.onLine) {
      console.log("Online: Attempting Supabase insert...");
      const { error } = await supabase.from('equipment').insert([payload]);
      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Insert error details:", JSON.stringify(error, null, 2));
        addToSyncQueue('ADD', payload);
      } else {
        console.log("Supabase insert successful.");
        // Refresh to get actual data from database
        await fetchItems();
      }
    } else {
      console.log("Offline: Adding to sync queue.");
      addToSyncQueue('ADD', payload);
    }
    setLoading(false);
  };

  const updateJobDetails = async (id: string, logs: TechnicianLog[], condition: FinalConditionType) => {
    // Optimistic Update
    setItems(items.map(item =>
      item.id === id ? {
        ...item,
        technicianLogs: logs,
        finalCondition: condition
      } : item
    ));

    const payload = { id, logs, condition };
    if (navigator.onLine) {
      const { error } = await supabase
        .from('equipment')
        .update({
          technician_logs: logs,
          final_condition: condition,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Supabase update error:", error);
        addToSyncQueue('UPDATE', payload);
      }
    } else {
      addToSyncQueue('UPDATE', payload);
    }
    return true;
  };

  const markAsFixed = async (id: string) => {
    const fixedDate = new Date().toISOString();

    // Optimistic Update with formatted date
    setItems(items.map(item =>
      item.id === id ? {
        ...item,
        status: EquipmentStatus.FIXED,
        fixedDate: fixedDate,
        formattedFixedDate: formatDateForDisplay(fixedDate)
      } : item
    ));

    const payload = { id, date: fixedDate };
    if (navigator.onLine) {
      const { error } = await supabase
        .from('equipment')
        .update({
          status: EquipmentStatus.FIXED,
          fixed_date: fixedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Supabase fix error:", error);
        addToSyncQueue('FIX', payload);
      }
    } else {
      addToSyncQueue('FIX', payload);
    }
  };

  if (isInitializing) return <Preloader />;
  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className={loading ? 'relative' : ''}>
      <Dashboard
        user={currentUser}
        items={items}
        onLogout={handleLogout}
        onAddItem={addItem}
        onMarkFixed={markAsFixed}
        onUpdateJob={updateJobDetails}
        onRefresh={() => fetchItems()}
        isLoading={loading}
      />

      {/* Network Status Indicators */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {!isOnline && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest animate-bounce flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Offline Mode
          </div>
        )}
        {loading && (
          <div className="bg-[#006097] text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            Syncing...
          </div>
        )}
      </div>
    </div>
  );
};

export default App;