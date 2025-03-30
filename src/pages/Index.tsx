
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="text-[#0289c7] font-medium mb-2">• Innovative Healthcare Solutions</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Your Health is <span className="text-[#0289c7]">Our Priority</span>
                </h1>
                <p className="text-gray-600 mb-8">
                  Experience personalized healthcare with our team of expert doctors and state-of-the-art facilities. We're committed to providing exceptional care that you can trust.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-[#0289c7] hover:bg-[#026e9e] text-white px-6">
                    Book an Appointment
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700">
                    Watch Our Story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7" 
                  alt="Healthcare professionals" 
                  className="rounded-lg shadow-xl"
                />
                
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs mt-4 transform -translate-y-20 translate-x-12">
                  <div className="flex items-center mb-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                    <h4 className="text-sm text-gray-600">Patient Satisfaction</h4>
                  </div>
                  <p className="text-xl font-bold">98.7%</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">10+</h2>
                <p className="text-gray-600">Years of Experience</p>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">100+</h2>
                <p className="text-gray-600">Medical Specialists</p>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">50k+</h2>
                <p className="text-gray-600">Happy Patients</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We offer a comprehensive range of healthcare services to meet all your medical needs under one roof.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Doctor Appointments",
                  icon: "👨‍⚕️",
                  description: "Schedule appointments with our highly qualified doctors for consultations and medical advice."
                },
                {
                  title: "X-ray Services",
                  icon: "🔍",
                  description: "State-of-the-art X-ray services for accurate diagnostic imaging and analysis."
                },
                {
                  title: "ECG Testing",
                  icon: "💓",
                  description: "Advanced electrocardiogram testing to monitor and diagnose heart conditions."
                },
                {
                  title: "MRI Scans",
                  icon: "🧠",
                  description: "Detailed magnetic resonance imaging for comprehensive internal organ visualization."
                }
              ].map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                  <a href="/services" className="mt-4 inline-block text-[#0289c7] hover:underline">Learn more →</a>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button className="bg-[#0289c7] hover:bg-[#026e9e] text-white">
                View All Services
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Patients Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't just take our word for it. Here's what our patients have to say about their experiences with MediCare.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  text: "The staff at MediCare was incredibly professional and caring. My doctor took the time to explain everything and address all my concerns.",
                  rating: 5
                },
                {
                  name: "Michael Chen",
                  text: "I was impressed by how efficient the appointment process was. The facility is modern and clean, and the doctors are knowledgeable and attentive.",
                  rating: 5
                },
                {
                  name: "Amelia Rodriguez",
                  text: "The care I received at MediCare was exceptional. From the front desk to the medical staff, everyone was friendly and helpful.",
                  rating: 4
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
