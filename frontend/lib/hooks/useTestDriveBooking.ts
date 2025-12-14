import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Vehicle, BookingFormData } from '../types';
import { createApiClient } from '../api/client';

interface UseTestDriveBookingProps {
  apiBase: string;
  onError?: (error: string) => void;
  onSuccess?: (reservationId: string) => void;
}

export function useTestDriveBooking({ apiBase, onError, onSuccess }: UseTestDriveBookingProps) {
  const api = useMemo(() => createApiClient(apiBase), [apiBase]);
  const apiBaseRef = useRef(apiBase);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    apiBaseRef.current = apiBase;
  }, [apiBase]);

  // Update refs when callbacks change, but don't trigger effects
  useEffect(() => {
    
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  const [locations, setLocations] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '09:00',
    duration: 45,
    name: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setIsErrorMessage(false);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Calculate min and max dates (today and 14 days from today)
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const max = new Date(today);
    max.setDate(today.getDate() + 14);
    return {
      minDate: today.toISOString().split('T')[0],
      maxDate: max.toISOString().split('T')[0]
    };
  }, []);

  // Load locations on mount only
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const locations = await api.getLocations();
        setLocations(locations || []);
        // Don't auto-select first location - let user choose
      } catch (error) {
        const errorMsg = 'Error loading locations: ' + (error as Error).message;
        setMessage(errorMsg);
        setIsErrorMessage(true);
        onErrorRef.current?.(errorMsg);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, [api]);

  // Load vehicles when location changes only
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!selectedLocation) {
        // Clear vehicles when no location is selected
        setVehicles([]);
        setSelectedVehicle(null);
        return;
      }
      try {
        setLoadingVehicles(true);
        setSelectedVehicle(null);
        setFormData(prev => ({ ...prev, date: '' }));
        const data = await api.getVehicles(selectedLocation);
        setVehicles(data || []);
        // Don't auto-select first vehicle - let user choose
      } catch (error) {
        const errorMsg = 'Error loading vehicles: ' + (error as Error).message;
        setMessage(errorMsg);
        setIsErrorMessage(true);
        onErrorRef.current?.(errorMsg);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, [selectedLocation, api]);

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (): string | null => {
    if (!selectedLocation) return 'Please select a location';
    if (!selectedVehicle) return 'Please select a vehicle';
    if (!formData.date) return 'Date is required';
    if (!formData.time) return 'Time is required';
    if (formData.duration <= 0) return 'Duration must be greater than 0';
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.phone.trim()) return 'Phone is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Invalid email format';
    
    return null;
  };

  // Computed value to check if form is valid (for UI purposes like showing submit button)
  const isFormValid = useMemo(() => {
    if (!selectedLocation) return false;
    if (!selectedVehicle) return false;
    if (!formData.date) return false;
    if (!formData.time) return false;
    if (formData.duration <= 0) return false;
    if (!formData.name.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return false;
    
    return true;
  }, [selectedLocation, selectedVehicle, formData.date, formData.time, formData.duration, formData.name, formData.email, formData.phone]);

  const submitBooking = async (): Promise<boolean> => {
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setIsErrorMessage(true);
      return false;
    }

    if (!selectedVehicle) {
      setMessage('Please select a vehicle');
      setIsErrorMessage(true);
      return false;
    }

    setLoading(true);
    setMessage('Booking your test drive...');
    setIsErrorMessage(false);
    
    try {
      // Single API call that checks availability and creates reservation
      const payload = {
        location: selectedLocation,
        vehicleType: selectedVehicle.type,
        startDateTime: new Date(`${formData.date}T${formData.time}:00Z`).toISOString(),
        durationMins: formData.duration,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone
      };
      
      const { response, data } = await api.book(payload);
      
      // Check for HTTP errors (backend now throws BadRequestException for unavailable bookings)
      if (!response.ok) { 
        let errorMsg = '';
        if (data.message) {
          errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        } else if (data.reason) {
          errorMsg = data.reason;
        } else if (typeof data === 'string') {
          errorMsg = data;
        } else {
          errorMsg = 'Booking failed. Please try again.';
        }
        setMessage(errorMsg);
        setIsErrorMessage(true);
        onErrorRef.current?.(errorMsg);
        return false; 
      }
      
      // Success - extract reservation ID
      const reservationId = data.reservation?._id || data.reservation?.id || data._id || data.id || '';
      if (!reservationId) {
        const errorMsg = 'Booking failed: No reservation ID received';
        setMessage(errorMsg);
        setIsErrorMessage(true);
        onErrorRef.current?.(errorMsg);
        return false;
      }
      
      setMessage('Booked successfully! Reservation ID: ' + reservationId);
      setIsErrorMessage(false);
      onSuccessRef.current?.(reservationId);
      
      // Reset form on success
      setFormData({
        date: '',
        time: '09:00',
        duration: 45,
        name: '',
        email: '',
        phone: '',
      });
      
      return true;
    } catch (e: any) {
      const errorMsg = 'Error: ' + e.message;
      setMessage(errorMsg);
      setIsErrorMessage(true);
      onErrorRef.current?.(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    locations,
    vehicles,
    selectedLocation,
    selectedVehicle,
    formData,
    message,
    isErrorMessage,
    isFormValid,
    loading,
    loadingLocations,
    loadingVehicles,
    minDate,
    maxDate,
    // Actions
    setSelectedLocation,
    setSelectedVehicle,
    updateFormData,
    submitBooking,
    setMessage,
  };
}

