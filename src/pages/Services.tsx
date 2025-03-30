
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Button } from '@/components/ui/button';

const Services = () => {
  const services = [
    {
      title: "Doctor Consultations",
      description: "Our experienced doctors provide personalized consultations to address your health concerns and provide expert medical advice.",
      icon: "👨‍⚕️",
      features: [
        "One-on-one consultations with specialists",
        "Comprehensive health assessments",
        "Personalized treatment plans",
        "Follow-up care and monitoring"
      ]
    },
    {
      title: "X-ray Services",
      description: "Our advanced X-ray facilities provide quick and accurate diagnostic imaging to help identify injuries and medical conditions.",
      icon: "🔍",
      features: [
        "Digital X-ray technology",
        "Immediate results available",
        "Expert radiologist interpretation",
        "Safe and minimal radiation exposure"
      ]
    },
    {
      title: "ECG Testing",
      description: "Our ECG services help detect heart abnormalities and assess cardiac health with precise monitoring and analysis.",
      icon: "💓",
      features: [
        "12-lead electrocardiogram testing",
        "Continuous monitoring options",
        "Stress ECG capabilities",
        "Detailed cardiac analysis"
      ]
    },
    {
      title: "MRI Scans",
      description: "Our state-of-the-art MRI equipment provides detailed imaging of internal organs and tissues for comprehensive diagnosis.",
      icon: "🧠",
      features: [
        "High-resolution 3D imaging",
        "Open MRI options for claustrophobic patients",
        "Full-body and targeted scans available",
        "Rapid result reporting"
      ]
    },
    {
      title: "Laboratory Services",
      description: "Our comprehensive laboratory services offer a wide range of tests to help diagnose and monitor health conditions.",
      icon: "🧪",
      features: [
        "Blood work and analysis",
        "Urinalysis and testing",
        "Pathology services",
        "Quick turnaround times"
      ]
    },
    {
      title: "Preventive Care",
      description: "Our preventive care programs help you maintain optimal health and detect potential issues before they become serious.",
      icon: "🛡️",
      features: [
        "Annual health check-ups",
        "Immunizations and vaccinations",
        "Health risk assessments",
        "Lifestyle and nutrition counseling"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 bg-[#f0f9ff]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Our Healthcare Services</h1>
              <p className="text-gray-600 mb-8">
                We offer a comprehensive range of medical services to meet your healthcare needs.
                Our team of experts is committed to providing the highest quality care using
                state-of-the-art technology and facilities.
              </p>
            </div>
          </div>
        </section>
        
        {/* Services List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-[#0289c7] mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full bg-[#0289c7] hover:bg-[#026e9e] text-white">
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-[#0289c7]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Need a Specialized Service?</h2>
              <p className="mb-8 text-blue-100">
                If you don't see the service you're looking for, contact us and our team will assist you in finding the right care for your needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="bg-white text-[#0289c7] hover:bg-gray-100">
                  Contact Us
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-[#026e9e]">
                  Book an Appointment
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Services;
