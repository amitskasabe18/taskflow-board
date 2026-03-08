import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface RegisterFormProps {
  onRegisterSuccess?: (userData: any) => void;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onLoginClick }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    organisation_uuid: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'register'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    setError(''); // Clear error on input change
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL || 'localhost:8000'}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('OTP sent to your email. Please check your inbox.');
        setStep('otp');
      } else {
        if (response.status === 409) {
          setError('A user with this email already exists. Please login instead.');
        } else {
          setError(result.message || 'Failed to send OTP');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL || 'localhost:8000'}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Email verified successfully. Please complete your registration.');
        setStep('register');
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestBody: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      };

      // Only include organisation_uuid if it's provided
      if (formData.organisation_uuid.trim()) {
        requestBody.organisation_uuid = formData.organisation_uuid;
      }

      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL || 'localhost:8000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        if (onRegisterSuccess) {
          onRegisterSuccess(result.data);
        }
        // Store token and redirect
        localStorage.setItem('auth_token', result.data.token);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        if (response.status === 409) {
          setError('A user with this email already exists. Please login instead.');
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div>
        <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Enter your email"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 rounded-md">
          <p className="text-sm">{error}</p>
          {error.includes('already exists') && (
            <button
              type="button"
              onClick={onLoginClick}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Click here to login
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 rounded-md">
          <p className="text-sm">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.email}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || !formData.email ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div>
        <label htmlFor="otp" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Enter OTP *
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={handleOtpChange}
          maxLength={6}
          required
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Enter 6-digit OTP"
        />
        <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          OTP sent to {formData.email}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 rounded-md">
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || otp.length !== 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button
          type="button"
          onClick={() => setStep('email')}
          className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-300'} hover:bg-gray-50 dark:hover:bg-gray-700`}
        >
          Back
        </button>
      </div>
    </form>
  );

  const renderRegisterStep = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            placeholder="First name"
          />
        </div>
        <div>
          <label htmlFor="last_name" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Password (min 6 characters)"
        />
      </div>

      <div>
        <label htmlFor="organisation_uuid" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Organization UUID (Optional)
        </label>
        <input
          type="text"
          id="organisation_uuid"
          name="organisation_uuid"
          value={formData.organisation_uuid}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Leave empty for individual registration"
        />
        <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Leave empty to register as individual user
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 rounded-md">
          <p className="text-sm">{error}</p>
          {error.includes('already exists') && (
            <button
              type="button"
              onClick={onLoginClick}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Click here to login
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 rounded-md">
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || !formData.first_name || !formData.last_name || !formData.password}
          className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || !formData.first_name || !formData.last_name || !formData.password ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
        >
          {loading ? 'Registering...' : 'Complete Registration'}
        </button>
        <button
          type="button"
          onClick={() => setStep('otp')}
          className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-300'} hover:bg-gray-50 dark:hover:bg-gray-700`}
        >
          Back
        </button>
      </div>
    </form>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}>
      <h2 className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Create Account
      </h2>

      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'email' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'email' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Email</span>
          </div>
          <div className={`flex items-center ${step === 'otp' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'otp' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Verify</span>
          </div>
          <div className={`flex items-center ${step === 'register' ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'register' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Register</span>
          </div>
        </div>
      </div>

      {/* Form Steps */}
      {step === 'email' && renderEmailStep()}
      {step === 'otp' && renderOtpStep()}
      {step === 'register' && renderRegisterStep()}

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLoginClick}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
