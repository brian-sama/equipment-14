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

  // Fetch Items directly from Supabase
  const fetchItems = useCallback(async (isFirstLoad: boolean = false) => {
    if (!isFirstLoad) setLoading(true);

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('received_date', { ascending: false });

      if (error) throw error;

      // Map server data
      const serverItems: Equipment[] = data ? data.map((item: any) => {
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
      }) : [];

      setItems(serverItems);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch records from the database. Please check your internet connection.");
    } finally {
      setLoading(false);
      if (isFirstLoad) setTimeout(() => setIsInitializing(false), 1000);
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

    try {
      // Generate Job Card Number based on current count (Note: This is not concurrency safe but matches previous logic)
      const count = items.length;
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const jobCardNo = `COMETZ${currentYear}/${String(count + 1).padStart(5, '0')}`;

      const receivedDate = new Date().toISOString();
      const tempId = crypto.randomUUID();

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

      const { error } = await supabase.from('equipment').insert([payload]);

      if (error) {
        throw error;
      }

      await fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to save the new job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateJobDetails = async (id: string, logs: TechnicianLog[], condition: FinalConditionType) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          technician_logs: logs,
          final_condition: condition,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchItems();
      return true;
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job details.");
      return false;
    }
  };

  const markAsFixed = async (id: string) => {
    try {
      const fixedDate = new Date().toISOString();
      const { error } = await supabase
        .from('equipment')
        .update({
          status: EquipmentStatus.FIXED,
          fixed_date: fixedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchItems();
    } catch (error) {
      console.error("Error completing job:", error);
      alert("Failed to mark job as fixed.");
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
      {/* Network Status Indicators - Simplified */}
      {loading && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className="bg-[#006097] text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            Syncing...
          </div>
        </div>
      )}
    </div>
  );
};

export default App;