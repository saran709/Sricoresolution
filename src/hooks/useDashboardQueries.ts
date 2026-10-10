import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Project,
  ProjectTask,
  Enquiry,
  SupportTicket,
  Invoice,
  Document as AppDocument,
  InternshipApplication,
  Notification as AppNotification,
  LeaveRequest,
  Attendance,
} from '../types';

/**
 * Fetch projects and associated milestone tasks with React Query caching
 */
export function useMyProjects(userId?: string) {
  return useQuery({
    queryKey: ['my-projects', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return { projects: [], tasks: [] };

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const projQuery = query(collection(db, 'projects'), where('clientId', '==', userId));
      const projSnap = await Promise.race([getDocs(projQuery), timeout]);

      if (!projSnap) return { projects: [], tasks: [] };

      const projects = projSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
      let tasks: ProjectTask[] = [];

      if (projects.length > 0) {
        const projectIds = projects.map((p) => p.id as string).filter(Boolean).slice(0, 10);
        if (projectIds.length > 0) {
          const taskQuery = query(collection(db, 'projectTasks'), where('projectId', 'in', projectIds));
          const taskSnap = await Promise.race([getDocs(taskQuery), timeout]);
          if (taskSnap) {
            tasks = taskSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask));
          }
        }
      }

      return { projects, tasks };
    },
  });
}

/**
 * Fetch all client dashboard data concurrently with React Query caching
 */
export function useClientDashboard(clientId?: string) {
  return useQuery({
    queryKey: ['client-dashboard', clientId],
    enabled: Boolean(clientId),
    queryFn: async () => {
      if (!clientId) {
        return {
          enquiries: [],
          projects: [],
          tickets: [],
          invoices: [],
          documents: [],
        };
      }

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const enqPromise = getDocs(query(collection(db, 'enquiries'), where('clientId', '==', clientId)));
      const projPromise = getDocs(query(collection(db, 'projects'), where('clientId', '==', clientId)));
      const tickPromise = getDocs(query(collection(db, 'support_tickets'), where('clientId', '==', clientId)));
      const invPromise = getDocs(query(collection(db, 'invoices'), where('clientId', '==', clientId)));
      const docPromise = getDocs(query(collection(db, 'documents'), where('ownerId', '==', clientId)));

      const [enqRes, projRes, tickRes, invRes, docRes] = await Promise.allSettled([
        Promise.race([enqPromise, timeout]),
        Promise.race([projPromise, timeout]),
        Promise.race([tickPromise, timeout]),
        Promise.race([invPromise, timeout]),
        Promise.race([docPromise, timeout]),
      ]);

      const enquiries: Enquiry[] = enqRes.status === 'fulfilled' && enqRes.value
        ? enqRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Enquiry))
        : [];

      const projects: Project[] = projRes.status === 'fulfilled' && projRes.value
        ? projRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Project))
        : [];

      const tickets: SupportTicket[] = tickRes.status === 'fulfilled' && tickRes.value
        ? tickRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket))
        : [];

      const invoices: Invoice[] = invRes.status === 'fulfilled' && invRes.value
        ? invRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice))
        : [];

      const documents: AppDocument[] = docRes.status === 'fulfilled' && docRes.value
        ? docRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument))
        : [];

      return { enquiries, projects, tickets, invoices, documents };
    },
  });
}

/**
 * Fetch candidate dashboard data with React Query caching
 */
export function useCandidateDashboard(candidateId?: string) {
  return useQuery({
    queryKey: ['candidate-dashboard', candidateId],
    enabled: Boolean(candidateId),
    queryFn: async () => {
      if (!candidateId) {
        return { applications: [], documents: [], notifications: [] };
      }

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const appPromise = getDocs(query(
        collection(db, 'internship_applications'),
        where('candidateId', '==', candidateId)
      ));
      const docPromise = getDocs(query(collection(db, 'documents'), where('ownerId', '==', candidateId)));
      const notifPromise = getDocs(query(collection(db, 'notifications'), where('userId', '==', candidateId)));

      const [appRes, docRes, notifRes] = await Promise.allSettled([
        Promise.race([appPromise, timeout]),
        Promise.race([docPromise, timeout]),
        Promise.race([notifPromise, timeout]),
      ]);

      const applications: (InternshipApplication & { programTitle?: string })[] = appRes.status === 'fulfilled' && appRes.value
        ? appRes.value.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              programTitle: data.programTitle || 'Internship Program',
            } as InternshipApplication & { programTitle?: string };
          })
        : [];

      const documents: AppDocument[] = docRes.status === 'fulfilled' && docRes.value
        ? docRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument))
        : [];

      const notifications: AppNotification[] = notifRes.status === 'fulfilled' && notifRes.value
        ? notifRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification))
        : [];

      return { applications, documents, notifications };
    },
  });
}

/**
 * Fetch employee dashboard data with React Query caching
 */
export function useEmployeeDashboard(employeeId?: string) {
  return useQuery({
    queryKey: ['employee-dashboard', employeeId],
    enabled: Boolean(employeeId),
    queryFn: async () => {
      if (!employeeId) {
        return { projects: [], tasks: [], leaveRequests: [], attendances: [] };
      }

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const projPromise = getDocs(query(
        collection(db, 'projects'),
        where('assignedEmployees', 'array-contains', employeeId)
      ));
      const taskPromise = getDocs(query(
        collection(db, 'projectTasks'),
        where('assignedTo', '==', employeeId)
      ));
      const leavePromise = getDocs(query(
        collection(db, 'leaveRequests'),
        where('userId', '==', employeeId)
      ));
      const attPromise = getDocs(query(
        collection(db, 'attendance'),
        where('userId', '==', employeeId)
      ));

      const [projRes, taskRes, leaveRes, attRes] = await Promise.allSettled([
        Promise.race([projPromise, timeout]),
        Promise.race([taskPromise, timeout]),
        Promise.race([leavePromise, timeout]),
        Promise.race([attPromise, timeout]),
      ]);

      const projects: Project[] = projRes.status === 'fulfilled' && projRes.value
        ? projRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Project))
        : [];

      const tasks: ProjectTask[] = taskRes.status === 'fulfilled' && taskRes.value
        ? taskRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask))
        : [];

      const leaveRequests: LeaveRequest[] = leaveRes.status === 'fulfilled' && leaveRes.value
        ? leaveRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as LeaveRequest))
        : [];

      const attendances: Attendance[] = attRes.status === 'fulfilled' && attRes.value
        ? attRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Attendance)).sort((a, b) => b.date - a.date)
        : [];

      return { projects, tasks, leaveRequests, attendances };
    },
  });
}
