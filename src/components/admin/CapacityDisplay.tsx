
import React from 'react';
import { DoctorCapacity } from '@/types/chatTypes';

interface CapacityDisplayProps {
  capacityData: Record<string, DoctorCapacity>;
}

const CapacityDisplay: React.FC<CapacityDisplayProps> = ({ capacityData }) => {
  if (Object.keys(capacityData).length === 0) {
    return <p className="text-gray-500">No capacity data available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(capacityData).map(([name, data]) => {
        const isDoctor = data.type === 'Doctor Appointment';
        const limit = isDoctor ? 50 : 100;
        const percentage = (data.count / limit) * 100;
        
        return (
          <div key={name} className="border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 capitalize">{name}</h3>
            <p className="text-sm text-gray-500">{data.type}</p>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
              <div 
                className={`h-full rounded-full ${
                  percentage > 90 ? 'bg-red-500' : 
                  percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-1 text-sm">
              {data.count} / {limit} ({Math.round(percentage)}%)
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CapacityDisplay;
