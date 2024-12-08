export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  consultationFee: number;
  availability?: {
    date: string;
    slots: {
      time: string;
      isBooked: boolean;
    }[];
  }[];
}

export interface Appointment {
  _id: string;
  doctor: Doctor;
  date: string;
  status: string;
  queueNumber: number;
  consultationType: string;
  paymentStatus: string;
  paymentMethod: string;
}