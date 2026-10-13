import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { auditAndReconcileProjects } from './projectMigration';

export interface SeedResult {
  departmentsCount: number;
  usersCount: number;
  projectsCount: number;
  tasksCount: number;
  enquiriesCount: number;
  applicationsCount: number;
  vendorsCount: number;
  announcementsCount: number;
  attendanceCount: number;
  leavesCount: number;
  errors?: string[];
}

export async function seedAdminDashboardData(currentAdminUid?: string): Promise<SeedResult> {
  const errors: string[] = [];
  const result: SeedResult = {
    departmentsCount: 0,
    usersCount: 0,
    projectsCount: 0,
    tasksCount: 0,
    enquiriesCount: 0,
    applicationsCount: 0,
    vendorsCount: 0,
    announcementsCount: 0,
    attendanceCount: 0,
    leavesCount: 0,
    errors
  };

  // 1. Departments
  const deptMap: Record<string, string> = {};
  try {
    const existingDepts = await getDocs(collection(db, 'departments'));
    existingDepts.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.name) {
        deptMap[data.name] = docSnap.id;
      }
    });

    const initialDepts = [
      {
        name: 'Software Engineering',
        description: 'Full-stack web applications, cloud microservices and enterprise digital platforms.'
      },
      {
        name: 'Embedded Systems & IoT',
        description: 'Industrial telemetry, custom sensor hardware, PCB layout and firmware engineering.'
      },
      {
        name: 'AI & Data Science',
        description: 'Deep learning models, computer vision pipelines and predictive intelligence engines.'
      },
      {
        name: 'Cloud Solutions & DevOps',
        description: 'Kubernetes orchestration, CI/CD pipelines, containerization and infrastructure reliability.'
      },
      {
        name: 'Research & Academic Training',
        description: 'Advanced student capstone guidance, IEEE technical publications and academic research.'
      }
    ];

    const deptPromises: Promise<any>[] = [];
    for (const d of initialDepts) {
      if (!deptMap[d.name]) {
        deptPromises.push(
          addDoc(collection(db, 'departments'), {
            name: d.name,
            description: d.description,
            managerId: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).then(docRef => {
            deptMap[d.name] = docRef.id;
          }).catch(err => {
            errors.push(`Department "${d.name}": ${err.message}`);
          })
        );
      }
    }
    if (deptPromises.length > 0) {
      await Promise.all(deptPromises);
    }
    result.departmentsCount = Object.keys(deptMap).length;
  } catch (deptErr: any) {
    console.warn("Notice seeding departments:", deptErr);
    errors.push(`Departments fetch error: ${deptErr.message}`);
  }

  // 2. Staff, Mentors, Interns, Candidates, and Clients
  const userMap: Record<string, string> = {};
  try {
    const existingUsers = await getDocs(collection(db, 'users'));
    const existingEmails = new Map<string, string>();
    existingUsers.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.email) {
        existingEmails.set(data.email.toLowerCase().trim(), docSnap.id);
      }
    });

    const sampleUsers = [
      // Mentors
      {
        key: 'rajesh',
        email: 'rajesh.m@sricoresolutions.com',
        firstName: 'Rajesh',
        lastName: 'Murugan',
        phone: '+91 98402 34567',
        role: 'MENTOR',
        position: 'Principal Hardware Architect',
        departmentId: deptMap['Embedded Systems & IoT'] || '',
        isActive: true
      },
      {
        key: 'ananya',
        email: 'ananya.sen@sricoresolutions.com',
        firstName: 'Dr. Ananya',
        lastName: 'Sen',
        phone: '+91 98403 45678',
        role: 'MENTOR',
        position: 'Director of AI Research',
        departmentId: deptMap['AI & Data Science'] || '',
        isActive: true
      },
      {
        key: 'karthik',
        email: 'karthik.v@sricoresolutions.com',
        firstName: 'Karthik',
        lastName: 'Venkatesh',
        phone: '+91 98401 23456',
        role: 'MENTOR',
        position: 'Lead Software Architect',
        departmentId: deptMap['Software Engineering'] || '',
        isActive: true
      },
      // Employees
      {
        key: 'vikram',
        email: 'vikram.raj@sricoresolutions.com',
        firstName: 'Vikram',
        lastName: 'Raj',
        phone: '+91 98404 56789',
        role: 'EMPLOYEE',
        position: 'DevOps & Cloud Lead',
        departmentId: deptMap['Cloud Solutions & DevOps'] || '',
        isActive: true
      },
      {
        key: 'sneha',
        email: 'sneha.patel@sricoresolutions.com',
        firstName: 'Sneha',
        lastName: 'Patel',
        phone: '+91 98405 67890',
        role: 'EMPLOYEE',
        position: 'Senior Frontend Developer',
        departmentId: deptMap['Software Engineering'] || '',
        isActive: true
      },
      {
        key: 'arun',
        email: 'arun.kumar@sricoresolutions.com',
        firstName: 'Arun',
        lastName: 'Kumar',
        phone: '+91 98406 78901',
        role: 'EMPLOYEE',
        position: 'Embedded Firmware Engineer',
        departmentId: deptMap['Embedded Systems & IoT'] || '',
        isActive: true
      },
      {
        key: 'divya',
        email: 'divya.nair@sricoresolutions.com',
        firstName: 'Divya',
        lastName: 'Nair',
        phone: '+91 98407 89012',
        role: 'EMPLOYEE',
        position: 'HR & Talent Specialist',
        departmentId: deptMap['Research & Academic Training'] || '',
        isActive: true
      },
      // Interns
      {
        key: 'rahul',
        email: 'rahul.verma@sricoresolutions.com',
        firstName: 'Rahul',
        lastName: 'Verma',
        phone: '+91 97100 11223',
        role: 'INTERN',
        position: 'Full-Stack Web Intern',
        departmentId: deptMap['Software Engineering'] || '',
        mentorKey: 'karthik',
        isActive: true
      },
      {
        key: 'meera',
        email: 'meera.k@sricoresolutions.com',
        firstName: 'Meera',
        lastName: 'Krishnan',
        phone: '+91 97100 22334',
        role: 'INTERN',
        position: 'IoT Smart Sensing Intern',
        departmentId: deptMap['Embedded Systems & IoT'] || '',
        mentorKey: 'rajesh',
        isActive: true
      },
      {
        key: 'sanjay',
        email: 'sanjay.n@sricoresolutions.com',
        firstName: 'Sanjay',
        lastName: 'Natarajan',
        phone: '+91 97100 33445',
        role: 'INTERN',
        position: 'Edge Computer Vision Intern',
        departmentId: deptMap['AI & Data Science'] || '',
        mentorKey: 'ananya',
        isActive: true
      },
      // Candidates
      {
        key: 'kavita',
        email: 'kavita.reddy@gmail.com',
        firstName: 'Kavita',
        lastName: 'Reddy',
        phone: '+91 96111 44556',
        role: 'CANDIDATE',
        position: 'Prospective AI Intern',
        departmentId: '',
        isActive: true
      },
      {
        key: 'deepak',
        email: 'deepak.j@gmail.com',
        firstName: 'Deepak',
        lastName: 'Joshi',
        phone: '+91 96111 55667',
        role: 'CANDIDATE',
        position: 'Prospective IoT Intern',
        departmentId: '',
        isActive: true
      },
      // Clients
      {
        key: 'greenagro',
        email: 'contact@greenagrotech.in',
        firstName: 'GreenAgro',
        lastName: 'Enterprises',
        phone: '+91 94440 88990',
        role: 'CLIENT',
        position: 'Client Representative',
        departmentId: '',
        isActive: true
      },
      {
        key: 'apexhealth',
        email: 'admin@apexhealth.org',
        firstName: 'Apex Healthcare',
        lastName: 'Systems',
        phone: '+91 94440 99001',
        role: 'CLIENT',
        position: 'Technical Procurement',
        departmentId: '',
        isActive: true
      }
    ];

    const userPromises: Promise<any>[] = [];
    for (const u of sampleUsers) {
      const cleanEmail = u.email.toLowerCase().trim();
      const existingId = existingEmails.get(cleanEmail);
      if (!existingId) {
        const userRef = doc(collection(db, 'users'));
        userMap[u.key] = userRef.id;
        userPromises.push(
          setDoc(userRef, {
            uid: userRef.id,
            id: userRef.id,
            email: cleanEmail,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phone,
            role: u.role,
            position: u.position,
            departmentId: u.departmentId || deptMap['Software Engineering'] || '',
            isActive: u.isActive,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => {
            errors.push(`User "${u.email}": ${err.message}`);
          })
        );
      } else {
        userMap[u.key] = existingId;
      }
    }

    if (userPromises.length > 0) {
      await Promise.all(userPromises);
    }
    result.usersCount = Object.keys(userMap).length;

    // Link mentor IDs for interns concurrently
    const linkPromises: Promise<any>[] = [];
    for (const u of sampleUsers) {
      if ((u as any).mentorKey && userMap[u.key] && userMap[(u as any).mentorKey]) {
        const internUserId = userMap[u.key];
        const mentorUserId = userMap[(u as any).mentorKey];
        linkPromises.push(
          setDoc(doc(db, 'users', internUserId), {
            mentorId: mentorUserId,
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(() => {})
        );
      }
    }

    // Update department manager links
    if (deptMap['Software Engineering'] && userMap['karthik']) {
      linkPromises.push(setDoc(doc(db, 'departments', deptMap['Software Engineering']), { managerId: userMap['karthik'] }, { merge: true }).catch(() => {}));
    }
    if (deptMap['Embedded Systems & IoT'] && userMap['rajesh']) {
      linkPromises.push(setDoc(doc(db, 'departments', deptMap['Embedded Systems & IoT']), { managerId: userMap['rajesh'] }, { merge: true }).catch(() => {}));
    }
    if (deptMap['AI & Data Science'] && userMap['ananya']) {
      linkPromises.push(setDoc(doc(db, 'departments', deptMap['AI & Data Science']), { managerId: userMap['ananya'] }, { merge: true }).catch(() => {}));
    }
    if (linkPromises.length > 0) {
      await Promise.all(linkPromises);
    }
  } catch (userErr: any) {
    console.warn("Notice seeding users:", userErr);
    errors.push(`Users fetch/seed error: ${userErr.message}`);
  }

  // 3. Projects (Reconcile complete Historical Projects Inventory safely without duplicates)
  try {
    const migrationReport = await auditAndReconcileProjects({
      dryRun: false,
      userUid: currentAdminUid,
      departmentMap: deptMap
    });
    result.projectsCount = migrationReport.newProjectsToCreate + migrationReport.matchedExisting;
    if (migrationReport.errors && migrationReport.errors.length > 0) {
      errors.push(...migrationReport.errors.slice(0, 3));
    }
  } catch (projErr: any) {
    console.warn("Historical projects reconciliation notice in seeder:", projErr);
    errors.push(`Projects reconciliation error: ${projErr.message}`);
  }

  // 4. Tasks (both in projectTasks and tasks so all components resolve them)
  try {
    const existingTasksSnap = await getDocs(collection(db, 'projectTasks'));
    const existingTitles = new Set(existingTasksSnap.docs.map(d => (d.data().title || '').trim().toLowerCase()));

    const sampleTasks = [
      {
        title: 'Calibrate LoRaWAN 868MHz sensor node ping and RSSI thresholds',
        projectId: 'Smart Industrial Energy Monitoring Hub',
        assignedTo: 'Rajesh Murugan',
        assigneeId: userMap['rajesh'] || 'staff',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-10-25',
        description: 'Run spectral sweeps on hardware test bench and log packet loss ratios.'
      },
      {
        title: 'Fine-tune YOLOv8 model weights on aerial agricultural crop canopy dataset',
        projectId: 'Autonomous Drone Navigation for Precision Agriculture',
        assignedTo: 'Dr. Ananya Sen',
        assigneeId: userMap['ananya'] || 'staff',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-10-30',
        description: 'Optimize bounding box precision for multispectral camera image feeds.'
      },
      {
        title: 'Implement JWT refresh rotation and secure HTTP-only cookie proxy',
        projectId: 'Omnichannel Retail Inventory ERP',
        assignedTo: 'Karthik Venkatesh',
        assigneeId: userMap['karthik'] || 'staff',
        status: 'REVIEW',
        priority: 'MEDIUM',
        dueDate: '2026-10-22',
        description: 'Verify token rotation test cases and revoke tokens on security events.'
      },
      {
        title: 'Assemble and solder 4-layer PCB prototype for current transformer telemetry',
        projectId: 'Smart Industrial Energy Monitoring Hub',
        assignedTo: 'Arun Kumar',
        assigneeId: userMap['arun'] || 'staff',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '2026-11-05',
        description: 'Ensure grounding isolation and solder flux cleaning inspection.'
      },
      {
        title: 'Draft comprehensive IEEE formatting report and algorithm flowchart',
        projectId: 'AI-Powered Medical Diagnostic Triage Assistant',
        assignedTo: 'Sanjay Natarajan',
        assigneeId: userMap['sanjay'] || 'staff',
        status: 'TODO',
        priority: 'LOW',
        dueDate: '2026-11-12',
        description: 'Complete block diagrams, confusion matrices, and ROC curves.'
      }
    ];

    const taskPromises: Promise<any>[] = [];
    let addedTasks = 0;
    for (const t of sampleTasks) {
      if (!existingTitles.has(t.title.trim().toLowerCase())) {
        addedTasks++;
        const taskPayload = {
          ...t,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        taskPromises.push(
          addDoc(collection(db, 'projectTasks'), taskPayload)
            .then(docRef => addDoc(collection(db, 'tasks'), { ...taskPayload, id: docRef.id }))
            .catch(err => {
              errors.push(`Task "${t.title}": ${err.message}`);
            })
        );
      }
    }
    if (taskPromises.length > 0) {
      await Promise.all(taskPromises);
    }
    result.tasksCount = existingTasksSnap.size + addedTasks;
  } catch (taskErr: any) {
    console.warn("Notice seeding tasks:", taskErr);
    errors.push(`Tasks seed error: ${taskErr.message}`);
  }

  // 5. Enquiries
  try {
    const existingEnquiries = await getDocs(collection(db, 'enquiries'));
    const existingEmails = new Set(existingEnquiries.docs.map(d => (d.data().email || '').trim().toLowerCase()));

    const sampleEnquiries = [
      {
        enquiryType: 'commercial',
        firstName: 'Aditya',
        lastName: 'Sharma',
        email: 'aditya.sharma@autoindustries.com',
        company: 'AutoIndustries India Ltd',
        phone: '+91 98840 11223',
        serviceInterest: 'IoT Industrial Solutions',
        message: 'Looking for a turnkey IoT telemetry implementation for our Chennai stamping plant with 40+ motor vibration nodes and power meters.',
        status: 'NEW'
      },
      {
        enquiryType: 'student',
        firstName: 'Divya',
        lastName: 'Balaji',
        email: 'divya.b@annauniv.edu',
        company: 'College of Engineering Guindy',
        phone: '+91 98840 22334',
        serviceInterest: 'Autonomous Robotics',
        message: 'Requesting institutional mentorship, hardware development boards, and algorithm evaluation for our final semester robotics capstone project.',
        status: 'NEW'
      },
      {
        enquiryType: 'research',
        firstName: 'Dr. Suresh',
        lastName: 'Natarajan',
        email: 'suresh.n@vit.ac.in',
        company: 'VIT University',
        phone: '+91 98840 33445',
        serviceInterest: 'Edge AI & Deep Learning',
        message: 'Joint research collaboration request for our acoustic anomaly detection paper targeted for IEEE Transactions on Industrial Informatics.',
        status: 'IN_PROGRESS'
      }
    ];

    const enqPromises: Promise<any>[] = [];
    let addedEnquiries = 0;
    for (const enq of sampleEnquiries) {
      if (!existingEmails.has(enq.email.trim().toLowerCase())) {
        addedEnquiries++;
        enqPromises.push(
          addDoc(collection(db, 'enquiries'), {
            ...enq,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => {
            errors.push(`Enquiry "${enq.email}": ${err.message}`);
          })
        );
      }
    }
    if (enqPromises.length > 0) {
      await Promise.all(enqPromises);
    }
    result.enquiriesCount = existingEnquiries.size + addedEnquiries;
  } catch (enqErr: any) {
    console.warn("Notice seeding enquiries:", enqErr);
    errors.push(`Enquiries seed error: ${enqErr.message}`);
  }

  // 6. Internship Applications
  try {
    const existingApps = await getDocs(collection(db, 'internship_applications'));
    const existingCandidateEmails = new Set(existingApps.docs.map(d => (d.data().candidateEmail || '').trim().toLowerCase()));

    const sampleApps = [
      {
        candidateName: 'Pooja Hegde',
        candidateEmail: 'pooja.hegde@gmail.com',
        college: 'PSG College of Technology, Coimbatore',
        degree: 'B.Tech AI & Data Science',
        graduationYear: 2026,
        programId: 'AI & Machine Learning',
        status: 'pending'
      },
      {
        candidateName: 'Harish Vignesh',
        candidateEmail: 'harish.v@gmail.com',
        college: 'SSN College of Engineering, Chennai',
        degree: 'B.E Electronics & Communication',
        graduationYear: 2026,
        programId: 'Embedded Systems & IoT',
        status: 'pending'
      },
      {
        candidateName: 'Ritu Saxena',
        candidateEmail: 'ritu.saxena@gmail.com',
        college: 'Amrita Vishwa Vidyapeetham',
        degree: 'M.Sc Applied Data Science',
        graduationYear: 2025,
        programId: 'Full-Stack Web Development',
        status: 'pending'
      }
    ];

    const appPromises: Promise<any>[] = [];
    let addedApps = 0;
    for (const app of sampleApps) {
      if (!existingCandidateEmails.has(app.candidateEmail.trim().toLowerCase())) {
        addedApps++;
        appPromises.push(
          addDoc(collection(db, 'internship_applications'), {
            ...app,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => {
            errors.push(`Intern application "${app.candidateEmail}": ${err.message}`);
          })
        );
      }
    }
    if (appPromises.length > 0) {
      await Promise.all(appPromises);
    }
    result.applicationsCount = existingApps.size + addedApps;
  } catch (appErr: any) {
    console.warn("Notice seeding internship applications:", appErr);
    errors.push(`Applications seed error: ${appErr.message}`);
  }

  // 7. Vendors
  try {
    const existingVendors = await getDocs(collection(db, 'vendors'));
    const existingVendorNames = new Set(existingVendors.docs.map(d => (d.data().name || '').trim().toLowerCase()));

    const sampleVendors = [
      {
        name: 'DigiKey Electronics India',
        contactPerson: 'Anand Kumar',
        email: 'support-in@digikey.com',
        phone: '+91 80 4000 1234',
        servicesProvided: 'Authorized semiconductor distribution, passive components, sensors and microcontrollers'
      },
      {
        name: 'Amazon Web Services (AWS) India',
        contactPerson: 'Enterprise Cloud Desk',
        email: 'enterprise-in@amazon.com',
        phone: '+91 80 6000 5678',
        servicesProvided: 'Production cloud hosting, S3 asset buckets, RDS databases and elastic compute clusters'
      },
      {
        name: 'Element14 / Farnell India',
        contactPerson: 'Priya Mohan',
        email: 'in-sales@element14.com',
        phone: '+91 80 2345 6789',
        servicesProvided: 'Raspberry Pi single-board computers, test instruments, soldering stations and prototyping tools'
      }
    ];

    const vendorPromises: Promise<any>[] = [];
    let addedVendors = 0;
    for (const v of sampleVendors) {
      if (!existingVendorNames.has(v.name.trim().toLowerCase())) {
        addedVendors++;
        vendorPromises.push(
          addDoc(collection(db, 'vendors'), {
            ...v,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => {
            errors.push(`Vendor "${v.name}": ${err.message}`);
          })
        );
      }
    }
    if (vendorPromises.length > 0) {
      await Promise.all(vendorPromises);
    }
    result.vendorsCount = existingVendors.size + addedVendors;
  } catch (vErr: any) {
    console.warn("Notice seeding vendors:", vErr);
    errors.push(`Vendors seed error: ${vErr.message}`);
  }

  // 8. Announcements
  try {
    const existingAnnouncements = await getDocs(collection(db, 'announcements'));
    const existingTitles = new Set(existingAnnouncements.docs.map(d => (d.data().title || '').trim().toLowerCase()));

    const sampleAnnouncements = [
      {
        title: 'Q4 2026 Innovation Showcase & Student Hackathon',
        content: 'Join us this Friday at 3:00 PM in the Main Conference Hall for live demonstrations of active student projects, autonomous robotics prototypes, and commercial client deliveries. All employees, mentors, and interns are invited.',
        targetRoles: ['EMPLOYEE', 'MENTOR', 'INTERN'],
        authorName: 'Executive Admin'
      },
      {
        title: 'New Hardware Lab Safety Guidelines & ESD Protocols',
        content: 'All engineers and interns working in the Embedded Systems & IoT lab must wear anti-static wrist straps, maintain component logbooks, and power down test equipment before departing.',
        targetRoles: ['EMPLOYEE', 'MENTOR', 'INTERN'],
        authorName: 'Rajesh Murugan (Principal Hardware Lead)'
      },
      {
        title: 'Diwali Festive Holiday Schedule & Standby Support Roster',
        content: 'The development center will observe holiday on October 31. Cloud infrastructure and IoT gateway uptime monitoring will be maintained remotely by the DevOps team.',
        targetRoles: ['EMPLOYEE', 'MENTOR', 'INTERN', 'CLIENT'],
        authorName: 'Human Resources'
      }
    ];

    const annPromises: Promise<any>[] = [];
    let addedAnnouncements = 0;
    for (const a of sampleAnnouncements) {
      if (!existingTitles.has(a.title.trim().toLowerCase())) {
        addedAnnouncements++;
        annPromises.push(
          addDoc(collection(db, 'announcements'), {
            ...a,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => {
            errors.push(`Announcement "${a.title}": ${err.message}`);
          })
        );
      }
    }
    if (annPromises.length > 0) {
      await Promise.all(annPromises);
    }
    result.announcementsCount = existingAnnouncements.size + addedAnnouncements;
  } catch (annErr: any) {
    console.warn("Notice seeding announcements:", annErr);
    errors.push(`Announcements seed error: ${annErr.message}`);
  }

  // 9. Attendance for Today
  try {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const staffToMark = [
      { key: 'karthik', status: 'present', time: '09:15 AM' },
      { key: 'rajesh', status: 'present', time: '09:05 AM' },
      { key: 'ananya', status: 'remote', time: '09:30 AM' },
      { key: 'vikram', status: 'present', time: '08:55 AM' },
      { key: 'sneha', status: 'present', time: '09:20 AM' },
      { key: 'arun', status: 'present', time: '09:10 AM' },
      { key: 'rahul', status: 'present', time: '09:40 AM' },
      { key: 'meera', status: 'remote', time: '09:45 AM' }
    ];

    const attPromises: Promise<any>[] = [];
    for (const s of staffToMark) {
      const uId = userMap[s.key];
      if (uId) {
        const attId = `${uId}_${todayDateStr}`;
        attPromises.push(
          setDoc(doc(db, 'attendance', attId), {
            userId: uId,
            date: todayDateStr,
            status: s.status,
            checkIn: s.time,
            updatedAt: serverTimestamp()
          }, { merge: true }).then(() => {
            result.attendanceCount++;
          }).catch(() => {})
        );
      }
    }
    if (attPromises.length > 0) {
      await Promise.all(attPromises);
    }
  } catch (attErr: any) {
    console.warn("Notice seeding attendance:", attErr);
    errors.push(`Attendance seed error: ${attErr.message}`);
  }

  // 10. Leave Requests
  try {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const existingLeaves = await getDocs(collection(db, 'leaveRequests'));
    if (existingLeaves.size === 0 && (userMap['sneha'] || userMap['arun'])) {
      const leavePromises: Promise<any>[] = [];
      if (userMap['sneha']) {
        leavePromises.push(
          addDoc(collection(db, 'leaveRequests'), {
            userId: userMap['sneha'],
            userName: 'Sneha Patel',
            type: 'medical',
            startDate: todayDateStr,
            endDate: todayDateStr,
            reason: 'Doctor appointment for routine dental surgery.',
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(() => {})
        );
      }
      if (userMap['arun']) {
        leavePromises.push(
          addDoc(collection(db, 'leaveRequests'), {
            userId: userMap['arun'],
            userName: 'Arun Kumar',
            type: 'casual',
            startDate: todayDateStr,
            endDate: todayDateStr,
            reason: 'Family event and travel.',
            status: 'approved',
            evaluatedBy: currentAdminUid || 'admin',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(() => {})
        );
      }
      await Promise.all(leavePromises);
      result.leavesCount = leavePromises.length;
    } else {
      result.leavesCount = existingLeaves.size;
    }
  } catch (leaveErr: any) {
    console.warn("Notice seeding leave requests:", leaveErr);
    errors.push(`Leaves seed error: ${leaveErr.message}`);
  }

  // 11. Initial Audit Logs
  try {
    const existingLogs = await getDocs(collection(db, 'auditLogs'));
    if (existingLogs.size === 0) {
      const sampleLogs = [
        { action: 'SYSTEM_SEEDED', details: 'Initialized organizational database with operational staff, projects, and departments', resourceType: 'system' },
        { action: 'PROJECT_CREATED', details: 'Created Smart Industrial Energy Monitoring Hub (commercial)', resourceType: 'project' },
        { action: 'ASSIGN_MENTOR', details: 'Designated Dr. Ananya Sen as Mentor for AI Research & Deep Learning', resourceType: 'user' },
        { action: 'POST_ANNOUNCEMENT', details: 'Published notice: Q4 2026 Innovation Showcase & Student Hackathon', resourceType: 'content' }
      ];

      const logPromises = sampleLogs.map(log => 
        addDoc(collection(db, 'auditLogs'), {
          ...log,
          performedBy: currentAdminUid || 'admin',
          timestamp: serverTimestamp()
        }).catch(() => {})
      );
      await Promise.all(logPromises);
    }
  } catch (logErr: any) {
    console.warn("Notice seeding audit logs:", logErr);
  }

  // 12. Company Billing Settings
  try {
    await setDoc(doc(db, 'settings', 'company_billing'), {
      companyName: 'Sricore Solutions Pvt Ltd',
      legalName: 'Sricore Solutions Technology Services Private Limited',
      address: 'Plot 42, Innovation Campus, OMR Tech Corridor, Chennai, TN - 600096',
      email: 'contact@sricoresolutions.com',
      phone: '+91 98400 12345',
      taxId: 'GSTIN33AAACS1234A1Z5',
      bankDetails: 'Bank: HDFC Bank\nA/C No: 50200098765432\nIFSC: HDFC0001842\nBranch: OMR Chennai',
      termsAndConditions: 'Payment is due within 15 days of invoice date. 18% GST applicable.',
      upiId: 'sricoresolutions@okhdfcbank',
      upiName: 'Sricore Solutions Pvt Ltd',
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (setErr: any) {
    console.warn("Notice seeding company settings:", setErr);
    errors.push(`Settings seed error: ${setErr.message}`);
  }

  return result;
}
