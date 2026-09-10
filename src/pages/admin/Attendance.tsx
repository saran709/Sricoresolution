import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function Attendance() {
  const columns = [
  {
    "key": "userId",
    "label": "User ID"
  },
  {
    "key": "date",
    "label": "Date",
    "type": "date"
  },
  {
    "key": "status",
    "label": "Status"
  },
  {
    "key": "checkIn",
    "label": "Check In Time"
  }
];
  
  return (
    <CrudTable 
      title="Attendance Logs"
      sheetName="attendance"
      columns={columns}
    />
  );
}
