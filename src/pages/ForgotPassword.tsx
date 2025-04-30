
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
      toast({
        title: "Reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message || "Please check if the email is correct and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Reset Your Password</h1>
            <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
          </div>
          
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto bg-green-100 text-green-800 p-4 rounded-md mb-6">
                <p>We've sent you an email with password reset instructions.</p>
                <p className="text-sm mt-2">Please check your inbox and spam folder.</p>
              </div>
              <Button 
                onClick={() => setIsSuccess(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white mr-2"
              >
                Send again
              </Button>
              <Link to="/login">
                <Button className="bg-[#0289c7] hover:bg-[#026e9e]">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-[#0289c7] hover:bg-[#026e9e]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-[#0289c7] hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
