import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function Vendors() {
  const columns = [
  {
    "key": "companyName",
    "label": "Company Name"
  },
  {
    "key": "contactPerson",
    "label": "Contact Person"
  },
  {
    "key": "email",
    "label": "Email",
    "type": "email"
  },
  {
    "key": "phone",
    "label": "Phone"
  },
  {
    "key": "status",
    "label": "Status"
  }
];
  
  return (
    <CrudTable 
      title="Vendors"
      sheetName="vendors"
      columns={columns}
    />
  );
}
