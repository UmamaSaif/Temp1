import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    name: string;
    specialty: string;
  };
  date: string;
  status: string;
  symptoms: string;
  consultationType: string;
  paymentStatus: string;
  paymentMethod: string;
  consultationFee: number;
}

class AppointmentService {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await axios.get(`${API_URL}/api/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: any): Promise<Appointment> {
    try {
      const response = await axios.post(`${API_URL}/api/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, data: any): Promise<Appointment> {
    try {
      const response = await axios.patch(`${API_URL}/api/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }
}

export default new AppointmentService();