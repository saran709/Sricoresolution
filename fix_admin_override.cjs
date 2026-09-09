const fs = require('fs');

// We are going to hardcode saranramesh709@gmail.com to instantly be an admin
// in the AuthContext when they log in.

let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const fetchLogic = `        // Fetch user role from Firestore
        try {
          const users = await readFromSheet('users', 'uid', user.uid);
          if (users && users.length > 0) {
            setUserProfile(users[0] as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }`;

const adminOverrideLogic = `        try {
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

          const users = await readFromSheet('users', 'uid', user.uid);
          if (users && users.length > 0) {
            setUserProfile(users[0] as UserProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }`;

code = code.replace(fetchLogic, adminOverrideLogic);

// Ensure the isAdmin check uses the email as well just to be safe
const isAdminLogic = `    isAdmin: userProfile?.role === 'ADMINISTRATOR',`;
const newIsAdminLogic = `    isAdmin: userProfile?.role === 'ADMINISTRATOR' || currentUser?.email === 'saranramesh709@gmail.com',`;

code = code.replace(isAdminLogic, newIsAdminLogic);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
