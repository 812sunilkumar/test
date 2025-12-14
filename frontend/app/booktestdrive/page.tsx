'use client';

import React, { Suspense } from 'react';
import { Box, Typography, Container, Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import { useTestDriveBooking } from '../../lib/hooks';

// Lazy load components
const LocationSelector = dynamic(() => import('../../components/LocationSelector'), {
  loading: () => <Skeleton variant="rounded" height={56} />,
});
const VehicleSelector = dynamic(() => import('../../components/VehicleSelector'), {
  loading: () => <Skeleton variant="rounded" height={56} />,
});
const VehicleInfo = dynamic(() => import('../../components/VehicleInfo'), {
  loading: () => <Skeleton variant="rounded" height={80} />,
});
const BookingFormFields = dynamic(() => import('../../components/BookingFormFields'), {
  loading: () => <Skeleton variant="rounded" height={300} />,
});
const BookingButton = dynamic(() => import('../../components/BookingButton'), {
  loading: () => <Skeleton variant="rounded" height={40} />,
});
const MessageDisplay = dynamic(() => import('../../components/MessageDisplay'), {
  loading: () => null,
});

export default function BookTestDrive() {
  const {
    locations,
    vehicles,
    selectedLocation,
    selectedVehicle,
    formData,
    message,
    loading,
    loadingLocations,
    loadingVehicles,
    minDate,
    maxDate,
    setSelectedLocation,
    setSelectedVehicle,
    updateFormData,
    submitBooking,
    setMessage,
  } = useTestDriveBooking({
    apiBase: process.env.PUBLIC_API_BASE || 'http://localhost:5000',
    onSuccess: (reservationId) => {
      console.log('Booking successful:', reservationId);
    },
    onError: (error) => {
      console.error('Booking error:', error);
    },
  });

  const handleBooking = async () => {
    await submitBooking();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Book Test Drive
      </Typography>
      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2, maxWidth: 500 }}>
        <LocationSelector
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          loading={loadingLocations}
        />

        <VehicleSelector
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onVehicleChange={setSelectedVehicle}
          loading={loadingVehicles}
          disabled={!selectedLocation}
        />

        {selectedVehicle && <VehicleInfo vehicle={selectedVehicle} />}

        <BookingFormFields
          formData={formData}
          onFormDataChange={updateFormData}
          selectedVehicle={selectedVehicle}
          minDate={minDate}
          maxDate={maxDate}
        />

        <BookingButton
          onClick={handleBooking}
          loading={loading}
          disabled={!selectedLocation || !selectedVehicle}
        />

        <MessageDisplay message={message} />
      </Box>
    </Container>
  );
}

