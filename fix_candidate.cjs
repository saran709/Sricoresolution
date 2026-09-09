const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/roles/CandidateDashboard.tsx', 'utf8');

code = code.replace("import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';", "import { readFromSheet } from '../../../lib/sheets';");
code = code.replace("import { db } from '../../../lib/firebase';", "");

const firestoreLogic = `        const appQuery = query(
          collection(db, 'internship_applications'),
          where('candidateId', '==', userProfile.uid)
        );
        const appSnap = await getDocs(appQuery);
        
        const apps = await Promise.all(appSnap.docs.map(async (docSnap) => {
          const appData = { id: docSnap.id, ...docSnap.data() } as InternshipApplication;
          let programTitle = 'Unknown Program';
          
          if (appData.programId) {
            try {
              const progDoc = await getDoc(doc(db, 'internship_programs', appData.programId));
              if (progDoc.exists()) {
                programTitle = progDoc.data().title || 'Unknown Program';
              }
            } catch (e) {
              // ignore
            }
          }
          return { ...appData, programTitle };
        }));
        
        setApplications(apps);
        
        const docQuery = query(collection(db, 'documents'), where('ownerId', '==', userProfile.uid));
        const docSnap = await getDocs(docQuery);
        setDocuments(docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppDocument)));

        const notifQuery = query(collection(db, 'notifications'), where('userId', '==', userProfile.uid));
        const notifSnap = await getDocs(notifQuery);
        setNotifications(notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification)));`;

const sheetLogic = `        const appsData = await readFromSheet('internship_applications', 'candidateId', userProfile.uid);
        const apps = await Promise.all(appsData.map(async (appData: any) => {
          let programTitle = 'Unknown Program';
          // Simulating fetch of program
          const progData = await readFromSheet('internship_programs', 'id', appData.programId);
          if (progData && progData.length > 0) {
             programTitle = progData[0].title || 'Unknown Program';
          }
          return { ...appData, programTitle } as InternshipApplication;
        }));
        setApplications(apps);
        
        const docsData = await readFromSheet('documents', 'ownerId', userProfile.uid);
        setDocuments(docsData as AppDocument[]);

        const notifsData = await readFromSheet('notifications', 'userId', userProfile.uid);
        setNotifications(notifsData as AppNotification[]);`;

code = code.replace(firestoreLogic, sheetLogic);
fs.writeFileSync('src/pages/dashboard/roles/CandidateDashboard.tsx', code);
