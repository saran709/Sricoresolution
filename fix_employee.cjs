const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', 'utf8');

code = code.replace("import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';", "import { readFromSheet, writeToSheet } from '../../../lib/sheets';");
code = code.replace("import { db } from '../../../lib/firebase';", "");

const fetchLogic = `        const projQuery = query(
          collection(db, 'projects'),
          where('assignedEmployees', 'array-contains', userProfile.uid)
        );
        const projSnap = await getDocs(projQuery);
        setProjects(projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));

        const taskQuery = query(
          collection(db, 'projectTasks'),
          where('assignedTo', '==', userProfile.uid)
        );
        const taskSnap = await getDocs(taskQuery);
        setTasks(taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectTask)));
        
        const leaveQuery = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', userProfile.uid),
        );
        const leaveSnap = await getDocs(leaveQuery);
        setLeaveRequests(leaveSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
        
        const attQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', userProfile.uid)
        );
        const attSnap = await getDocs(attQuery);
        setAttendances(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)).sort((a,b) => b.date - a.date));`;

const sheetFetchLogic = `        const projData = await readFromSheet('projects');
        setProjects(projData.filter((p: any) => p.assignedEmployees && p.assignedEmployees.includes(userProfile.uid)) as Project[]);

        const taskData = await readFromSheet('projectTasks', 'assignedTo', userProfile.uid);
        setTasks(taskData as ProjectTask[]);
        
        const leaveData = await readFromSheet('leaveRequests', 'userId', userProfile.uid);
        setLeaveRequests(leaveData as LeaveRequest[]);
        
        const attData = await readFromSheet('attendance', 'userId', userProfile.uid);
        setAttendances((attData as Attendance[]).sort((a: any,b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));`;

code = code.replace(fetchLogic, sheetFetchLogic);

const taskLogic = `      await updateDoc(doc(db, 'projectTasks', taskId), {
        status: newStatus
      });`;
const sheetTaskLogic = `      // In a real sheet we would need an update mechanism, but we'll append a status update or rely on local state for now
      // This is a mockup as webhook needs update action
      await writeToSheet('task_updates', { taskId, status: newStatus });`;
code = code.replace(taskLogic, sheetTaskLogic);

const leaveLogic = `      const docRef = await addDoc(collection(db, 'leaveRequests'), data);
      setLeaveRequests([...leaveRequests, { id: docRef.id, ...data } as LeaveRequest]);`;
const sheetLeaveLogic = `      const docId = 'LR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await writeToSheet('leaveRequests', { id: docId, ...data });
      setLeaveRequests([...leaveRequests, { id: docId, ...data } as LeaveRequest]);`;
code = code.replace(leaveLogic, sheetLeaveLogic);

const attLogic = `      const docRef = await addDoc(collection(db, 'attendance'), attData);
      setAttendances([{ id: docRef.id, ...attData } as Attendance, ...attendances]);`;
const sheetAttLogic = `      const docId = 'ATT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await writeToSheet('attendance', { id: docId, ...attData });
      setAttendances([{ id: docId, ...attData } as Attendance, ...attendances]);`;
code = code.replace(attLogic, sheetAttLogic);

fs.writeFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', code);
