import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useVerificationCheck } from './VerificationCheck';
import { toast } from 'react-toastify';

const VerifiedRoute = ({ element, requiresVerification = true, action }) => {
  const navigate = useNavigate();
  const { isVerified, loading, redirectToProfile } = useVerificationCheck();

  useEffect(() => {
    // Only check verification if this route requires it
    if (requiresVerification && !loading && !isVerified) {
      toast.warning(`Verification required: You need to verify your NID before you can ${action || 'access this page'}.`);
      navigate('/user-profile', { replace: true });
    }
  }, [isVerified, loading, requiresVerification, navigate, action]);

  // While checking verification status, show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If verification is not required or user is verified, render the component
  if (!requiresVerification || isVerified) {
    return element;
  }

  // This line should never be reached due to the useEffect redirect, but just in case
  return <Navigate to="/user-profile" replace />;
};

export default VerifiedRoute; 