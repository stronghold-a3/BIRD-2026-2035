import React from 'react';

/**
 * ErrorButton Component
 * 
 * A test component to verify Sentry error tracking is working correctly.
 * Click this button to trigger a test error that will be sent to Sentry.
 * 
 * ⚠️ REMOVE THIS COMPONENT IN PRODUCTION
 */
export const ErrorButton: React.FC = () => {
  const handleClick = () => {
    // Throw a test error to verify Sentry integration
    throw new Error('This is your first error!');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
      aria-label="Trigger test error for Sentry"
    >
      Break the world
    </button>
  );
};
