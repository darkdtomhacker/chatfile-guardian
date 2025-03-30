
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="w-full py-4 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-[#0289c7] rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-[#0289c7]">MediCare</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 text-gray-600">
            <Link to="/" className="hover:text-[#0289c7] transition-colors">Home</Link>
            <Link to="/services" className="hover:text-[#0289c7] transition-colors">Services</Link>
            <Link to="/about" className="hover:text-[#0289c7] transition-colors">About</Link>
            <Link to="/contact" className="hover:text-[#0289c7] transition-colors">Contact</Link>
            {currentUser && (
              <Link to="/dashboard" className="hover:text-[#0289c7] transition-colors">Dashboard</Link>
            )}
            {currentUser && isAdmin && (
              <Link to="/admin" className="hover:text-[#0289c7] transition-colors">Admin</Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="tel:1-800-MEDICARE" className="hidden md:flex items-center text-gray-600 hover:text-[#0289c7]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              1-800-MEDICARE
            </a>
            
            {currentUser ? (
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-[#0289c7] text-[#0289c7] hover:bg-[#0289c7] hover:text-white"
              >
                Logout
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline" 
                  className="border-[#0289c7] text-[#0289c7] hover:bg-[#0289c7] hover:text-white"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-[#0289c7] hover:bg-[#026e9e] text-white"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
