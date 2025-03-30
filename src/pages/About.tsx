
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Button } from '@/components/ui/button';

const About = () => {
  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Dr. Johnson has over 20 years of experience in internal medicine and healthcare administration."
    },
    {
      name: "Dr. Michael Chen",
      role: "Head of Cardiology",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Dr. Chen is a renowned cardiologist with expertise in treating complex heart conditions."
    },
    {
      name: "Dr. Amelia Rodriguez",
      role: "Head of Radiology",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Dr. Rodriguez leads our imaging department with cutting-edge diagnostic techniques."
    },
    {
      name: "Dr. James Wilson",
      role: "Head of Surgery",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      bio: "Dr. Wilson specializes in minimally invasive surgical procedures and patient recovery."
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
              <h1 className="text-4xl font-bold mb-4">About MediCare</h1>
              <p className="text-gray-600 mb-4">
                Providing exceptional healthcare services since 2010
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <img 
                  src="https://images.unsplash.com/photo-1631815588090-d4bfec5b7e6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="MediCare Facility" 
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2 md:pl-12">
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  MediCare was founded in 2010 with a simple mission: to provide accessible, high-quality healthcare to everyone. What started as a small clinic has grown into a comprehensive healthcare center serving thousands of patients annually.
                </p>
                <p className="text-gray-600 mb-4">
                  Our founder, Dr. Robert Miller, envisioned a healthcare facility where patients would receive personalized care in a comfortable environment. Today, that vision continues to guide everything we do.
                </p>
                <p className="text-gray-600">
                  Over the years, we've expanded our services, upgraded our facilities, and brought together a team of exceptional healthcare professionals, all while maintaining our commitment to patient-centered care.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-gray-600">
                These core principles guide our approach to healthcare and shape every interaction we have with our patients.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Patient-Centered Care",
                  icon: "❤️",
                  description: "We put patients first, designing our services and facilities around their needs and comfort."
                },
                {
                  title: "Medical Excellence",
                  icon: "🏆",
                  description: "We are committed to the highest standards of medical practice and continuous improvement."
                },
                {
                  title: "Integrity & Compassion",
                  icon: "🤝",
                  description: "We treat each patient with respect, empathy, and honesty in all our interactions."
                }
              ].map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
              <p className="text-gray-600">
                Meet the experienced professionals who lead our medical center with expertise and compassion.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-[#0289c7] mb-2">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-[#0289c7]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Join Our Healthcare Family</h2>
              <p className="mb-8">
                Experience the MediCare difference with personalized care from our expert team.
              </p>
              <Button className="bg-white text-[#0289c7] hover:bg-gray-100">
                Book an Appointment
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ChatBot />
    </div>
  );
};

export default About;
