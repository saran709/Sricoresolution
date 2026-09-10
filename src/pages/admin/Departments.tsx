import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function Departments() {
  const columns = [
  {
    "key": "name",
    "label": "Department Name"
  },
  {
    "key": "head",
    "label": "Department Head"
  },
  {
    "key": "email",
    "label": "Contact Email",
    "type": "email"
  }
];
  
  return (
    <CrudTable 
      title="Departments"
      sheetName="departments"
      columns={columns}
    />
  );
}
