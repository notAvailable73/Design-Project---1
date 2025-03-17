import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const OtpTimer = ({ seconds = 120, onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    // Reset the timer when seconds prop changes
    setTimeLeft(seconds);
    
    if (seconds <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimerComplete && onTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(timer);
  }, [seconds, onTimerComplete]);
  
  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const remainingSeconds = timeLeft % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  
  // Calculate percentage for progress bar
  const progressPercentage = Math.round((timeLeft / seconds) * 100);
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-sm text-gray-400 mb-2">
        OTP expires in {formatTime()}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: progressPercentage > 50 
              ? '#A855F7' // purple-500
              : progressPercentage > 25 
                ? '#F59E0B' // amber-500
                : '#EF4444' // red-500
          }}
        />
      </div>
    </div>
  );
};

OtpTimer.propTypes = {
  seconds: PropTypes.number,
  onTimerComplete: PropTypes.func
};

export default OtpTimer; 