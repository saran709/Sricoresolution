import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  where 
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
}

export async function seedAdminDashboardData(currentAdminUid?: string): Promise<SeedResult> {
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
    leavesCount: 0
  };

  // 1. Departments
  const existingDepts = await getDocs(collection(db, 'departments'));
  const deptMap: Record<string, string> = {};

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

  for (const d of initialDepts) {
    const existing = existingDepts.docs.find(docSnap => docSnap.data().name === d.name);
    if (!existing) {
      const docRef = await addDoc(collection(db, 'departments'), {
        name: d.name,
        description: d.description,
        managerId: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      deptMap[d.name] = docRef.id;
      result.departmentsCount++;
    } else {
      deptMap[d.name] = existing.id;
    }
  }

  // 2. Staff, Mentors, Interns, Candidates, and Clients
  const existingUsers = await getDocs(collection(db, 'users'));
  const userMap: Record<string, string> = {};

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
      position: '',
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
      position: '',
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

  for (const u of sampleUsers) {
    const existing = existingUsers.docs.find(docSnap => docSnap.data().email === u.email);
    if (!existing) {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        position: u.position,
        departmentId: u.departmentId,
        isActive: u.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      userMap[u.key] = userRef.id;
      result.usersCount++;
    } else {
      userMap[u.key] = existing.id;
    }
  }

  // Link mentor IDs for interns
  for (const u of sampleUsers) {
    if ((u as any).mentorKey && userMap[u.key] && userMap[(u as any).mentorKey]) {
      const internUserId = userMap[u.key];
      const mentorUserId = userMap[(u as any).mentorKey];
      try {
        await setDoc(doc(db, 'users', internUserId), {
          mentorId: mentorUserId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Could not link mentor for intern:", err);
      }
    }
  }

  // Update department manager links
  if (deptMap['Software Engineering'] && userMap['karthik']) {
    await setDoc(doc(db, 'departments', deptMap['Software Engineering']), { managerId: userMap['karthik'] }, { merge: true });
  }
  if (deptMap['Embedded Systems & IoT'] && userMap['rajesh']) {
    await setDoc(doc(db, 'departments', deptMap['Embedded Systems & IoT']), { managerId: userMap['rajesh'] }, { merge: true });
  }
  if (deptMap['AI & Data Science'] && userMap['ananya']) {
    await setDoc(doc(db, 'departments', deptMap['AI & Data Science']), { managerId: userMap['ananya'] }, { merge: true });
  }

  // 3. Projects (Reconcile complete Historical Projects Inventory safely without duplicates)
  try {
    const migrationReport = await auditAndReconcileProjects({
      dryRun: false,
      userUid: currentAdminUid,
      departmentMap: deptMap
    });
    result.projectsCount = migrationReport.newProjectsToCreate + migrationReport.matchedExisting;
  } catch (projErr) {
    console.warn("Historical projects reconciliation error in seeder:", projErr);
  }

  // 4. Tasks (both in projectTasks and tasks so all components resolve them)
  const existingTasks = await getDocs(collection(db, 'projectTasks'));
  const sampleTasks = [
    {
      title: 'Calibrate LoRaWAN 868MHz sensor node ping and RSSI thresholds',
      projectId: 'Smart Industrial Energy Monitoring Hub',
      assignedTo: 'Rajesh Murugan',
      assigneeId: userMap['rajesh'] || 'staff',
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    },
    {
      title: 'Fine-tune YOLOv8 model weights on aerial agricultural crop canopy dataset',
      projectId: 'Autonomous Drone Navigation for Precision Agriculture',
      assignedTo: 'Dr. Ananya Sen',
      assigneeId: userMap['ananya'] || 'staff',
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    },
    {
      title: 'Implement JWT refresh rotation and secure HTTP-only cookie proxy',
      projectId: 'Omnichannel Retail Inventory ERP',
      assignedTo: 'Karthik Venkatesh',
      assigneeId: userMap['karthik'] || 'staff',
      status: 'REVIEW',
      priority: 'MEDIUM'
    },
    {
      title: 'Assemble and solder 4-layer PCB prototype for current transformer telemetry',
      projectId: 'Smart Industrial Energy Monitoring Hub',
      assignedTo: 'Arun Kumar',
      assigneeId: userMap['arun'] || 'staff',
      status: 'TODO',
      priority: 'MEDIUM'
    },
    {
      title: 'Draft comprehensive IEEE formatting report and algorithm flowchart',
      projectId: 'AI-Powered Medical Diagnostic Triage Assistant',
      assignedTo: 'Sanjay Natarajan',
      assigneeId: userMap['sanjay'] || 'staff',
      status: 'TODO',
      priority: 'LOW'
    }
  ];

  if (existingTasks.empty) {
    for (const t of sampleTasks) {
      const taskPayload = {
        ...t,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'projectTasks'), taskPayload);
      await addDoc(collection(db, 'tasks'), taskPayload);
      result.tasksCount++;
    }
  }

  // 5. Enquiries
  const existingEnquiries = await getDocs(collection(db, 'enquiries'));
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

  if (existingEnquiries.empty) {
    for (const enq of sampleEnquiries) {
      await addDoc(collection(db, 'enquiries'), {
        ...enq,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      result.enquiriesCount++;
    }
  }

  // 6. Internship Applications
  const existingApps = await getDocs(collection(db, 'internship_applications'));
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

  if (existingApps.empty) {
    for (const app of sampleApps) {
      await addDoc(collection(db, 'internship_applications'), {
        ...app,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      result.applicationsCount++;
    }
  }

  // 7. Vendors
  const existingVendors = await getDocs(collection(db, 'vendors'));
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

  if (existingVendors.empty) {
    for (const v of sampleVendors) {
      await addDoc(collection(db, 'vendors'), {
        ...v,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      result.vendorsCount++;
    }
  }

  // 8. Announcements
  const existingAnnouncements = await getDocs(collection(db, 'announcements'));
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

  if (existingAnnouncements.empty) {
    for (const a of sampleAnnouncements) {
      await addDoc(collection(db, 'announcements'), {
        ...a,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      result.announcementsCount++;
    }
  }

  // 9. Attendance for Today
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

  for (const s of staffToMark) {
    const uId = userMap[s.key];
    if (uId) {
      const attId = `${uId}_${todayDateStr}`;
      await setDoc(doc(db, 'attendance', attId), {
        userId: uId,
        date: todayDateStr,
        status: s.status,
        checkIn: s.time,
        updatedAt: serverTimestamp()
      }, { merge: true });
      result.attendanceCount++;
    }
  }

  // 10. Leave Requests
  const existingLeaves = await getDocs(collection(db, 'leaveRequests'));
  if (existingLeaves.empty && userMap['sneha'] && userMap['arun']) {
    await addDoc(collection(db, 'leaveRequests'), {
      userId: userMap['sneha'],
      userName: 'Sneha Patel',
      type: 'medical',
      startDate: todayDateStr,
      endDate: todayDateStr,
      reason: 'Doctor appointment for routine dental surgery.',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'leaveRequests'), {
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
    });
    result.leavesCount = 2;
  }

  // 11. Initial Audit Logs
  const existingLogs = await getDocs(collection(db, 'auditLogs'));
  if (existingLogs.empty) {
    const sampleLogs = [
      { action: 'SYSTEM_SEEDED', details: 'Initialized organizational database with operational staff, projects, and departments', resourceType: 'system' },
      { action: 'PROJECT_CREATED', details: 'Created Smart Industrial Energy Monitoring Hub (commercial)', resourceType: 'project' },
      { action: 'ASSIGN_MENTOR', details: 'Designated Dr. Ananya Sen as Mentor for AI Research & Deep Learning', resourceType: 'user' },
      { action: 'POST_ANNOUNCEMENT', details: 'Published notice: Q4 2026 Innovation Showcase & Student Hackathon', resourceType: 'content' }
    ];

    for (const log of sampleLogs) {
      await addDoc(collection(db, 'auditLogs'), {
        ...log,
        performedBy: currentAdminUid || 'admin',
        timestamp: serverTimestamp()
      });
    }
  }

  // 12. Company Billing Settings
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

  return result;
}
