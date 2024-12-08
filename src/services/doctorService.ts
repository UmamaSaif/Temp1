import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  consultationFee: number;
  availability: {
    date: string;
    slots: {
      time: string;
      isBooked: boolean;
    }[];
  }[];
}

class DoctorService {
  async searchDoctors(criteria: {
    name?: string;
    specialty?: string;
    availableDate?: string;
    availableTime?: string;
  }): Promise<Doctor[]> {
    try {
      const response = await axios.get(`${API_URL}/api/doctors/search`, { params: criteria });
      return response.data;
    } catch (error) {
      console.error('Error searching doctors:', error);
      throw error;
    }
  }

  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await axios.get(`${API_URL}/api/doctors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }

  async getDoctorAvailability(doctorId: string, date: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/doctors/${doctorId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      throw error;
    }
  }
}

export default new DoctorService();