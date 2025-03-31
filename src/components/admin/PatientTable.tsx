
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PatientData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PatientTableProps {
  patients: PatientData[];
  loading: boolean;
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, loading }) => {
  if (loading) {
    return <p>Loading patients data...</p>;
  }

  if (patients.length === 0) {
    return <p className="text-gray-500">No registered patients yet.</p>;
  }

  return (
    <Table>
      <TableCaption>Total patients: {patients.length}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Registered On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>{new Date(patient.createdAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PatientTable;
