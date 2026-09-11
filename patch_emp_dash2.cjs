const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', 'utf8');

const target = code.substring(code.indexOf('useEffect(() => {'), code.indexOf('}, [userProfile]);') + '}, [userProfile]);'.length);

const newFetch = `useEffect(() => {
    if (!userProfile?.uid) return;
    
    setEmployeeData(userProfile as Employee);

    const unsubProjects = firebaseService.subscribeToCollection('projects', (data) => {
      setProjects(data.filter((p: any) => p.assignedEmployees && p.assignedEmployees.includes(userProfile.uid)) as Project[]);
    });

    const unsubTasks = firebaseService.subscribeToQuery('projectTasks', 'assignedTo', '==', userProfile.uid, (data) => {
      setTasks(data as ProjectTask[]);
    });

    const unsubLeave = firebaseService.subscribeToQuery('leaveRequests', 'userId', '==', userProfile.uid, (data) => {
      setLeaveRequests(data as LeaveRequest[]);
    });

    const unsubAtt = firebaseService.subscribeToQuery('attendance', 'userId', '==', userProfile.uid, (data) => {
      setAttendances((data as Attendance[]).sort((a: any,b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });

    return () => {
      if (unsubProjects) unsubProjects();
      if (unsubTasks) unsubTasks();
      if (unsubLeave) unsubLeave();
      if (unsubAtt) unsubAtt();
    };
  }, [userProfile]);`;

code = code.replace(target, newFetch);
fs.writeFileSync('src/pages/dashboard/roles/EmployeeDashboard.tsx', code);
