import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  User,
  Project,
  ProjectTask,
  Enquiry,
  Document as AppDocument,
  InternshipApplication,
  InternshipProgram,
  ActivityHistory,
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
          payments: [],
          documents: [],
        };
      }

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const enqPromise = getDocs(query(collection(db, 'enquiries'), where('clientId', '==', clientId)));
      const projPromise = getDocs(query(collection(db, 'projects'), where('clientId', '==', clientId)));
      const paymentPromise = getDocs(query(collection(db, 'payments'), where('clientId', '==', clientId)));
      const docPromise = getDocs(query(collection(db, 'documents'), where('ownerId', '==', clientId)));

      const [enqRes, projRes, paymentRes, docRes] = await Promise.allSettled([
        Promise.race([enqPromise, timeout]),
        Promise.race([projPromise, timeout]),
        Promise.race([paymentPromise, timeout]),
        Promise.race([docPromise, timeout]),
      ]);

      const enquiries: Enquiry[] = enqRes.status === 'fulfilled' && enqRes.value
        ? enqRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Enquiry))
        : [];

      const projects: Project[] = projRes.status === 'fulfilled' && projRes.value
        ? projRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as Project))
        : [];

      const payments = paymentRes.status === 'fulfilled' && paymentRes.value
        ? paymentRes.value.docs.map((d) => ({ id: d.id, ...d.data() }))
        : [];

      const documents: AppDocument[] = docRes.status === 'fulfilled' && docRes.value
        ? docRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as AppDocument))
        : [];

      return { enquiries, projects, payments, documents };
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
        ? attRes.value.docs
            .map((d) => ({ id: d.id, ...d.data() } as Attendance))
            .sort((a, b) => {
              const dateA = typeof a.date === 'string' ? a.date : (a.date?.toDate ? a.date.toDate().toISOString() : String(a.date || ''));
              const dateB = typeof b.date === 'string' ? b.date : (b.date?.toDate ? b.date.toDate().toISOString() : String(b.date || ''));
              return dateB.localeCompare(dateA);
            })
        : [];

      return { projects, tasks, leaveRequests, attendances };
    },
  });
}

/**
 * Fetch mentor dashboard data with React Query caching and single-field index safety
 */
export function useMentorDashboard(mentorId?: string) {
  return useQuery({
    queryKey: ['mentor-dashboard', mentorId],
    enabled: Boolean(mentorId),
    queryFn: async () => {
      if (!mentorId) {
        return { interns: [], tasks: [] };
      }

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const mentorFieldPromise = getDocs(
        query(collection(db, 'users'), where('mentorId', '==', mentorId))
      );
      const assignedMentorPromise = getDocs(
        query(collection(db, 'users'), where('assignedMentorId', '==', mentorId))
      );

      const [resA, resB] = await Promise.allSettled([
        Promise.race([mentorFieldPromise, timeout]),
        Promise.race([assignedMentorPromise, timeout]),
      ]);

      const internMap = new Map<string, User>();
      if (resA.status === 'fulfilled' && resA.value) {
        resA.value.docs.forEach((d) => internMap.set(d.id, { id: d.id, ...d.data() } as User));
      }
      if (resB.status === 'fulfilled' && resB.value) {
        resB.value.docs.forEach((d) => internMap.set(d.id, { id: d.id, ...d.data() } as User));
      }

      const interns = Array.from(internMap.values());
      const tasks: ProjectTask[] = [];

      if (interns.length > 0) {
        const internIds = interns.map((i) => i.id!).filter(Boolean);
        const batchPromises = [];
        for (let i = 0; i < Math.min(internIds.length, 20); i += 10) {
          const batch = internIds.slice(i, i + 10);
          batchPromises.push(
            Promise.race([
              getDocs(query(collection(db, 'projectTasks'), where('assignedTo', 'in', batch))),
              timeout,
            ])
          );
        }
        const taskSnapshots = await Promise.allSettled(batchPromises);
        taskSnapshots.forEach((snapRes) => {
          if (snapRes.status === 'fulfilled' && snapRes.value) {
            snapRes.value.docs.forEach((d) => {
              tasks.push({ id: d.id, ...d.data() } as ProjectTask);
            });
          }
        });
      }

      return { interns, tasks };
    },
  });
}

/**
 * Fetch intern/student dashboard data with React Query caching and single-field index safety
 */
export function useInternDashboard(
  userProfile?: (User & { mentorId?: string; assignedMentorId?: string; programId?: string }) | null
) {
  const uid = userProfile?.uid;
  const mentorId = userProfile?.mentorId || userProfile?.assignedMentorId;
  const programId = userProfile?.programId;

  return useQuery({
    queryKey: ['intern-dashboard', uid, mentorId, programId],
    enabled: Boolean(uid),
    queryFn: async () => {
      if (!uid) {
        return { mentor: null, program: null, tasks: [], feedback: [] };
      }

      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const mentorPromise = mentorId ? getDoc(doc(db, 'users', mentorId)) : Promise.resolve(null);
      const programPromise = programId
        ? getDoc(doc(db, 'internship_programs', programId))
        : Promise.resolve(null);
      const taskPromise = getDocs(
        query(collection(db, 'projectTasks'), where('assignedTo', '==', uid))
      );
      const fbPromise = getDocs(
        query(collection(db, 'auditLogs'), where('resourceId', '==', uid))
      );

      const [mentorRes, programRes, taskRes, fbRes] = await Promise.allSettled([
        Promise.race([mentorPromise, timeout]),
        Promise.race([programPromise, timeout]),
        Promise.race([taskPromise, timeout]),
        Promise.race([fbPromise, timeout]),
      ]);

      const mentor: User | null =
        mentorRes.status === 'fulfilled' &&
        mentorRes.value &&
        'exists' in mentorRes.value &&
        mentorRes.value.exists()
          ? ({ id: mentorRes.value.id, ...mentorRes.value.data() } as User)
          : null;

      const program: InternshipProgram | null =
        programRes.status === 'fulfilled' &&
        programRes.value &&
        'exists' in programRes.value &&
        programRes.value.exists()
          ? ({ id: programRes.value.id, ...programRes.value.data() } as InternshipProgram)
          : null;

      const tasks: ProjectTask[] =
        taskRes.status === 'fulfilled' && taskRes.value && 'docs' in taskRes.value
          ? taskRes.value.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectTask))
          : [];

      const feedback: ActivityHistory[] =
        fbRes.status === 'fulfilled' && fbRes.value && 'docs' in fbRes.value
          ? fbRes.value.docs
              .map((d) => ({ id: d.id, ...d.data() } as ActivityHistory))
              .filter((item) =>
                ['INTERN_FEEDBACK', 'INTERN_EVALUATION'].includes(item.action)
              )
          : [];

      return { mentor, program, tasks, feedback };
    },
  });
}
