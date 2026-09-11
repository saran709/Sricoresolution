const fs = require('fs');
let r = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const oldBlock = `          // Hardcoded Admin Override for the owner
          if (user.email === 'saranramesh709@gmail.com') {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              firstName: 'Saran',
              lastName: 'Ramesh',
              role: 'ADMINISTRATOR',
              isActive: true
            } as UserProfile);
            setLoading(false);
            return;
          }`;

const newBlock = `          let userDoc = null;
          try {
            const docSnap = await firebaseService.getById('users', user.uid);
            if (docSnap) {
                userDoc = docSnap;
            } else {
                // If the master admin logs in for the very first time and isn't in DB, create their record
                if (user.email === 'saranramesh709@gmail.com') {
                    userDoc = await firebaseService.createWithId('users', user.uid, {
                        uid: user.uid,
                        email: user.email,
                        firstName: 'Saran',
                        lastName: 'Ramesh',
                        role: 'ADMINISTRATOR',
                        isActive: true
                    });
                }
            }
          } catch(e) { console.error(e); }
          
          if (userDoc) {
            setUserProfile(userDoc as unknown as UserProfile);
          } else {
            setUserProfile(null);
          }`;

// Let's replace the whole try block contents
const oldTryBlock = `        try {
          // Hardcoded Admin Override for the owner
          if (user.email === 'saranramesh709@gmail.com') {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              firstName: 'Saran',
              lastName: 'Ramesh',
              role: 'ADMINISTRATOR',
              isActive: true
            } as UserProfile);
            setLoading(false);
            return;
          }

          const users = await firebaseService.getByQuery('users', 'uid', '==', user.uid);
          if (users && users.length > 0) {
            setUserProfile(users[0] as unknown as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {`;

const newTryBlock = `        try {
${newBlock}
        } catch (error) {`;

if (r.includes("Hardcoded Admin Override for the owner")) {
    r = r.replace(oldTryBlock, newTryBlock);
    fs.writeFileSync('src/contexts/AuthContext.tsx', r);
    console.log("AuthContext fixed!");
} else {
    console.log("AuthContext pattern not found!");
}
