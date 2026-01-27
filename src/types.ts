
export type UserType = 'Admin' | 'Attachee';

export enum EquipmentStatus {
  PENDING = 'Pending',
  FIXED = 'Fixed'
}

export type PriorityType = 'High' | 'Medium' | 'Low';
export type FinalConditionType = 'Working' | 'Partially' | 'Dead' | null;

export interface TechnicianLog {
  date: string;
  technician: string;
  action: string;
}

export interface Equipment {
  id: string;
  jobCardNo: string;
  type: string;
  serialNumber: string;
  officeNumber: string;
  assignedTo: string;
  loggedBy: UserType;
  receivedDate: string;
  fixedDate?: string;
  status: EquipmentStatus;
  priority: PriorityType;
  osFirmware?: string;
  notes?: string;
  technicianLogs: TechnicianLog[];
  finalCondition?: FinalConditionType;
}

export type TabType = 'All' | 'Received' | 'Fixed';
