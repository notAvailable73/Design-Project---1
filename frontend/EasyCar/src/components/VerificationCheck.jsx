import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaIdCard, FaExclamationTriangle } from 'react-icons/fa';
import axiosInstance from '../utils/axiosInstance';

// This component shows a modal when a user is not verified for certain actions
const VerificationCheck = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
          <h2 className="text-xl font-bold mb-3">Verification Required</h2>
          <p className="text-gray-300 mb-6">
            {message || "You need to verify your account with your NID before you can perform this action."}
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/user-profile')}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg flex items-center"
            >
              <FaIdCard className="mr-2" />
              Verify Now
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to check if a user is verified
export const useVerificationCheck = () => {
  const [isVerified, setIsVerified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    checkVerification();
  }, []);
  
  const checkVerification = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/profile');
      setIsVerified(response.data.isVerified);
    } catch (error) {
      console.error("Failed to check verification status:", error);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };
  
  const requireVerification = (action, customMessage) => {
    if (loading) return true; // Still loading, don't allow action yet
    
    if (!isVerified) {
      setVerificationMessage(customMessage || `You need to verify your account with NID before you can ${action}.`);
      setShowVerificationModal(true);
      return false;
    }
    
    return true;
  };
  
  // Function to redirect to user profile with verification message
  const redirectToProfile = (action) => {
    if (loading) return false;
    
    if (!isVerified) {
      toast.warning(`Verification required: You need to verify your NID before you can ${action}.`);
      navigate('/user-profile');
      return false;
    }
    
    return true;
  };
  
  return {
    isVerified,
    loading,
    requireVerification,
    redirectToProfile,
    VerificationModal: () => (
      <VerificationCheck
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        message={verificationMessage}
      />
    )
  };
};

export default VerificationCheck; 