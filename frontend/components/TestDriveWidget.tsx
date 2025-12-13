import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

type Props = { apiBase?: string; vehicleType?: string; location?: string };

export default function TestDriveWidget({ apiBase='http://localhost:5000', vehicleType='tesla_model3', location='dublin' }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(45);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const validateForm = (): string | null => {
    if (!date) return 'Date is required';
    if (!time) return 'Time is required';
    if (duration <= 0) return 'Duration must be greater than 0';
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!phone.trim()) return 'Phone is required';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    
    return null;
  };

  const checkAvailability = async () => {
    const start = new Date(`${date}T${time}:00Z`).toISOString();
    const res = await fetch(`${apiBase}/availability?location=${location}&vehicleType=${vehicleType}&startDateTime=${encodeURIComponent(start)}&durationMins=${duration}`);
    return res.json();
  };

  const onBook = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setLoading(true);
    setMessage('Checking...');
    try {
      const avail = await checkAvailability();
      if (!avail.available) { 
        setMessage('Not available: ' + (avail.reason || '')); 
        setLoading(false);
        return; 
      }
      const payload = {
        vehicleId: avail.vehicle?.id ?? avail.vehicleId ?? 'unknown',
        startDateTime: new Date(`${date}T${time}:00Z`).toISOString(),
        durationMins: duration,
        customerName: name,
        customerEmail: email,
        customerPhone: phone
      };
      const r = await fetch(`${apiBase}/reservations`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok) { 
        setMessage('Error: ' + (data.message || JSON.stringify(data))); 
        setLoading(false);
        return; 
      }
      setMessage('Booked! id: ' + (data._id || data.id || ''));
      // Reset form on success
      setDate('');
      setTime('09:00');
      setDuration(45);
      setName('');
      setEmail('');
      setPhone('');
    } catch (e: any) {
      setMessage('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ border: '1px solid #ddd', p:2, borderRadius:2, maxWidth:420 }}>
      <Typography variant="h6">Book test drive - {vehicleType}</Typography>
      <TextField 
        label="Date" 
        type="date" 
        fullWidth 
        value={date} 
        onChange={e=>setDate(e.target.value)} 
        InputLabelProps={{ shrink:true }} 
        inputProps={{
          min: minDate,
          max: maxDate
        }}
        required
        sx={{my:1}} 
      />
      <TextField 
        label="Time" 
        type="time" 
        fullWidth 
        value={time} 
        onChange={e=>setTime(e.target.value)} 
        InputLabelProps={{ shrink:true }} 
        required
        sx={{my:1}} 
      />
      <TextField 
        label="Duration (mins)" 
        type="number" 
        fullWidth 
        value={duration} 
        onChange={e=>setDuration(Number(e.target.value))} 
        inputProps={{ min: 1 }}
        required
        sx={{my:1}} 
      />
      <TextField 
        label="Name" 
        fullWidth 
        value={name} 
        onChange={e=>setName(e.target.value)} 
        required
        sx={{my:1}} 
      />
      <TextField 
        label="Email" 
        type="email"
        fullWidth 
        value={email} 
        onChange={e=>setEmail(e.target.value)} 
        required
        sx={{my:1}} 
      />
      <TextField 
        label="Phone" 
        fullWidth 
        value={phone} 
        onChange={e=>setPhone(e.target.value)} 
        required
        sx={{my:1}} 
      />
      <Button 
        variant="contained" 
        onClick={onBook} 
        disabled={loading}
        sx={{mt:1}} 
        fullWidth
      >
        {loading ? 'Processing...' : 'Book'}
      </Button>
      {message && (
        <Typography 
          sx={{
            mt:1, 
            color: message.includes('Error') || message.includes('Not available') ? 'error.main' : 'success.main'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
