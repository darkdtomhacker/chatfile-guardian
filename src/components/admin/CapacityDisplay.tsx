
import React from 'react';
import { DoctorCapacity } from '@/types/chatTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CapacityDisplayProps {
  capacityData: Record<string, DoctorCapacity>;
}

const CapacityDisplay: React.FC<CapacityDisplayProps> = ({ capacityData }) => {
  if (Object.keys(capacityData).length === 0) {
    return <p className="text-gray-500">No capacity data available yet.</p>;
  }

  // Group capacity data by department type
  const groupedData: Record<string, {count: number, total: number, type: string}> = {};
  
  Object.entries(capacityData).forEach(([name, data]) => {
    // Extract department name - assuming format like "dr. smith" -> "Smith"
    const nameParts = name.split(' ');
    const department = nameParts[nameParts.length - 1].toLowerCase();
    
    const isDoctor = data.type === 'Doctor Appointment';
    const limit = isDoctor ? 50 : 100;
    
    const key = `${department}-${data.type}`;
    
    if (!groupedData[key]) {
      groupedData[key] = {
        count: data.count,
        total: limit,
        type: data.type
      };
    } else {
      groupedData[key].count += data.count;
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(groupedData).map(([key, data]) => {
        const [department, type] = key.split('-');
        const percentage = (data.count / data.total) * 100;
        
        return (
          <Card key={key} className="border rounded-lg shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="capitalize text-lg font-medium">{department}</CardTitle>
              <p className="text-sm text-gray-500">{data.type}</p>
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
