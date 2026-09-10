import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function Leave() {
  const columns = [
  {
    "key": "userId",
    "label": "User ID"
  },
  {
    "key": "startDate",
    "label": "Start Date",
    "type": "date"
  },
  {
    "key": "endDate",
    "label": "End Date",
    "type": "date"
  },
  {
    "key": "reason",
    "label": "Reason"
  },
  {
    "key": "status",
    "label": "Status"
  }
];
  
  return (
    <CrudTable 
      title="Leave Requests"
      sheetName="leaveRequests"
      columns={columns}
    />
  );
}
