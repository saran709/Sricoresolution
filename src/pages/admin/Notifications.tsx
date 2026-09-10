import React from 'react';
import { CrudTable } from '../../components/ui/CrudTable';

export default function Notifications() {
  const columns = [
  {
    "key": "title",
    "label": "Title"
  },
  {
    "key": "message",
    "label": "Message"
  },
  {
    "key": "type",
    "label": "Type"
  },
  {
    "key": "audience",
    "label": "Audience (Role)"
  }
];
  
  return (
    <CrudTable 
      title="Global Notifications"
      sheetName="notifications"
      columns={columns}
    />
  );
}
