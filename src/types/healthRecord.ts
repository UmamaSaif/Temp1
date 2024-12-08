export interface HealthRecord {
  _id: string;
  patient: string;
  doctor: string;
  type: 'diagnosis' | 'treatment' | 'weight' | 'blood_pressure' | 'heart_rate';
  value: number | string;
  date: string;
  notes?: string;
  status: 'active' | 'resolved' | 'ongoing';
  createdAt: string;
  updatedAt: string;
}