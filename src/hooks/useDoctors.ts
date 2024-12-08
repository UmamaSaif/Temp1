import { useState, useEffect } from 'react';
import axios from 'axios';
import { Doctor } from '../types/doctor';
import { SearchCriteria } from '../types/appointment';

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const searchDoctors = async (criteria: SearchCriteria) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/doctors/search', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: criteria
      });
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to search doctors');
      console.error('Error searching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/doctors/specialties', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSpecialties(response.data);
      } catch (err) {
        console.error('Error fetching specialties:', err);
      }
    };

    fetchSpecialties();
  }, []);

  return { doctors, loading, error, specialties, searchDoctors };
}