const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const missingRules = `
    match /notifications/{docId} {
      allow read: if isValidId(docId) && isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create, update, delete: if isAdmin() || isEmployee();
    }
    match /project_requests/{docId} {
      allow create: if true;
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }
    match /projectTasks/{taskId} {
      allow read: if isValidId(taskId) && (
        isAdmin() || isEmployee() || isMentor()
        || (isAuthenticated() && resource.data.assigneeId == request.auth.uid)
      );
      allow create: if isAdmin() || isEmployee() || isMentor();
      allow update: if isValidId(taskId) && (
        isAdmin() || isEmployee() || isMentor()
        || (isAuthenticated() && resource.data.assigneeId == request.auth.uid)
      );
      allow delete: if isValidId(taskId) && (isAdmin() || isEmployee());
    }
    match /support_tickets/{taskId} {
      allow read: if isValidId(taskId) && (
        isAdmin() || isEmployee() || isMentor()
        || (isAuthenticated() && resource.data.clientId == request.auth.uid)
      );
      allow create: if isAuthenticated() && incoming().clientId == request.auth.uid;
      allow update: if isValidId(taskId) && (
        isAdmin() || isEmployee() || isMentor()
        || (isAuthenticated() && resource.data.clientId == request.auth.uid)
      );
      allow delete: if isValidId(taskId) && (isAdmin() || isEmployee());
    }
    match /attendance/{docId} {
      allow read: if isAdmin() || isEmployee();
      allow create, update: if isAdmin() || isEmployee();
      allow delete: if isAdmin();
    }
    match /leaveRequests/{docId} {
      allow read: if isAdmin() || isEmployee();
      allow create, update: if isAdmin() || isEmployee();
      allow delete: if isAdmin();
    }
    match /newsletters/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /newsletter_subscribers/{docId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
`;

code = code.replace(/  \}\n\}$/, missingRules + "  }\n}");

fs.writeFileSync('firestore.rules', code);
