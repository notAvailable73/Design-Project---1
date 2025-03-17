import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const OtpInput = ({ length = 6, value, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update internal state when external value changes
  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, length);
      setOtp([...otpArray, ...Array(length - otpArray.length).fill("")]);
    } else {
      setOtp(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const { value } = e.target;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Create a copy of the otp array
    const newOtp = [...otp];
    
    // Take the first digit if user pastes multiple digits
    newOtp[index] = value.substring(0, 1);
    setOtp(newOtp);
    
    // Combine the array into a string and call the onChange prop
    const otpValue = newOtp.join("");
    onChange(otpValue);
    
    // Auto focus on next input if user entered a digit
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to previous input when backspace is pressed
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    }
    
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    
    // Filter only digits from pasted content
    const digits = pasteData.replace(/\D/g, "").substring(0, length);
    
    if (digits) {
      const newOtp = [...Array(length).fill("")];
      
      // Fill in the digits
      digits.split("").forEach((digit, idx) => {
        if (idx < length) newOtp[idx] = digit;
      });
      
      setOtp(newOtp);
      
      // Call onChange with the new value
      onChange(digits);
      
      // Focus on the next empty input or the last one
      const focusIndex = Math.min(digits.length, length - 1);
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 md:gap-3 mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold rounded-lg bg-gray-800 text-white border-2 border-purple-600 focus:border-purple-400 focus:outline-none"
        />
      ))}
    </div>
  );
};

OtpInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default OtpInput; 