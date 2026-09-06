import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ActivityHistory } from '../types';

export const logActivity = async (
  action: string,
  performedBy: string,
  resourceId: string,
  resourceType: ActivityHistory['resourceType'],
  details: string
) => {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      action,
      performedBy,
      resourceId,
      resourceType,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
