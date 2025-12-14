'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTestDriveBooking } from '../../lib/hooks';
// Loading component
// const LoadingSkeleton = ({ height }: { height: string }) => (
//   <div className={`${height} bg-gray-200 rounded animate-pulse`} />
// );


// // Only lazy load heavy/non-critical components
// const VehicleInfo = dynamic(() => import('../../components/VehicleInfo'), {
//   ssr: false,
//   loading: () => <LoadingSkeleton height="h-20" />,
// });

// // Import critical components directly (they're needed immediately)
// import LocationSelector from '../../components/LocationSelector';
// import VehicleSelector from '../../components/VehicleSelector';
// import BookingFormFields from '../../components/BookingFormFields';
// import BookingButton from '../../components/BookingButton';
// import MessageDisplay from '../../components/MessageDisplay';


// Lazy load components
const LocationSelector = dynamic(() => import('../../components/LocationSelector'), {
  loading: () => <div className="h-14 bg-gray-200 rounded animate-pulse" />,
});
const VehicleSelector = dynamic(() => import('../../components/VehicleSelector'), {
  loading: () => <div className="h-14 bg-gray-200 rounded animate-pulse" />,
});
const VehicleInfo = dynamic(() => import('../../components/VehicleInfo'), {
  loading: () => <div className="h-20 bg-gray-200 rounded animate-pulse" />,
});
const BookingFormFields = dynamic(() => import('../../components/BookingFormFields'), {
  loading: () => <div className="h-72 bg-gray-200 rounded animate-pulse" />,
});
const BookingButton = dynamic(() => import('../../components/BookingButton'), {
  loading: () => <div className="h-10 bg-gray-200 rounded animate-pulse" />,
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
    isErrorMessage,
    isFormValid,
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
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Test Drive</h1>
          <p className="text-gray-600">Fill in the details below to schedule your test drive</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-6">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Location & Vehicle</h2>
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
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h2>
              <BookingFormFields
                formData={formData}
                onFormDataChange={updateFormData}
                selectedVehicle={selectedVehicle}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>

            {isFormValid && (
              <BookingButton
                onClick={handleBooking}
                loading={loading}
                disabled={false}
              />
            )}

            <MessageDisplay message={message} isError={isErrorMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

