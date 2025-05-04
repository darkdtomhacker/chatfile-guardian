import React from 'react';
import { DoctorCapacity } from '@/types/chatTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { standardDepartments } from '@/components/ChatBot/flows/constants/departments';

interface CapacityDisplayProps {
  capacityData: Record<string, DoctorCapacity>;
}

const CapacityDisplay: React.FC<CapacityDisplayProps> = ({ capacityData }) => {
  if (Object.keys(capacityData).length === 0) {
    return <p className="text-gray-500">No capacity data available yet.</p>;
  }

  // Define our card types - doctor departments and other appointment types
  const appointmentTypeCards = [
    { type: "X-ray", limit: 100 },
    { type: "ECG", limit: 100 },
    { type: "MRI", limit: 100 }
  ];
  
  // Group capacity data by department or type
  const groupedData: Record<string, {count: number, total: number}> = {};
  
  // Initialize all departments with zero count
  for (const dept of standardDepartments) {
    groupedData[dept] = { count: 0, total: 100 };
  }
  
  // Initialize other appointment types
  for (const appType of appointmentTypeCards) {
    groupedData[appType.type.toLowerCase()] = { count: 0, total: appType.limit };
  }
  
  // Process capacity data
  Object.entries(capacityData).forEach(([name, data]) => {
    const lowercaseName = name.toLowerCase();
    
    if (data.type === 'Doctor Appointment') {
      // Find which standard department this entry belongs to
      let matchedDepartment = standardDepartments.find(dept => lowercaseName.includes(dept));
      
      if (matchedDepartment) {
        groupedData[matchedDepartment].count += data.count;
      }
    } else {
      // For non-doctor appointments (X-ray, ECG, MRI)
      const typeLower = data.type.toLowerCase();
      if (groupedData[typeLower]) {
        groupedData[typeLower].count += data.count;
      }
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Doctor appointment cards */}
      {standardDepartments.map((department) => {
        const data = groupedData[department];
        const percentage = (data.count / data.total) * 100;
        
        return (
          <Card key={department} className="border rounded-lg shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="capitalize text-lg font-medium">
                {department}
              </CardTitle>
              <p className="text-sm text-gray-500">Doctor Appointment</p>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    percentage > 90 ? 'bg-red-500' : 
                    percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-2 text-sm">
                {data.count} / {data.total} ({Math.round(percentage)}%)
              </p>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Other appointment type cards */}
      {appointmentTypeCards.map((appType) => {
        const data = groupedData[appType.type.toLowerCase()] || {count: 0, total: appType.limit};
        const percentage = (data.count / data.total) * 100;
        
        return (
          <Card key={appType.type} className="border rounded-lg shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {appType.type}
              </CardTitle>
              <p className="text-sm text-gray-500">Diagnostic Test</p>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    percentage > 90 ? 'bg-red-500' : 
                    percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-2 text-sm">
                {data.count} / {data.total} ({Math.round(percentage)}%)
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CapacityDisplay;
