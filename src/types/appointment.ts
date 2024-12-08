export interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    name: string;
    specialty: string;
  };
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  symptoms: string;
  consultationType: 'in-person' | 'video' | 'phone';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'cash' | 'online';
  consultationFee: number;
  queueNumber: number;
}

export interface SearchCriteria {
  name: string;
  specialty: string;
  availableDate: string;
  availableTime: string;
}

export interface BookingFormData {
  doctorId: string;
  date: string;
  symptoms: string;
  consultationType: string;
  additionalDetails: string;
}