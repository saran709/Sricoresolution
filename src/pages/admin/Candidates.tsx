import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function Candidates() {
  const columns = [
  {
    "key": "firstName",
    "label": "First Name"
  },
  {
    "key": "lastName",
    "label": "Last Name"
  },
  {
    "key": "email",
    "label": "Email",
    "type": "email"
  },
  {
    "key": "role",
    "label": "Role"
  }
];
  
  return (
    <CrudTable 
      title="Candidates"
      sheetName="users"
      columns={columns} filterLogic={(u: any) => u.role === 'CANDIDATE'}
    />
  );
}
