cat << 'RULES_END' > firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // =========================================================================
    // Core Helper Functions
    // =========================================================================
    function isAuthenticated() { return request.auth != null; }
    function incoming() { return request.resource.data; }
    function existing() { return resource.data; }
    function isAdmin() { return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMINISTRATOR'; }
    function isEmployee() { return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'EMPLOYEE'; }
    function isMentor() { return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'MENTOR'; }
    function isClient() { return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'CLIENT'; }
    function isIntern() { return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'INTERN'; }
    function isOwner(userId) { return request.auth.uid == userId; }
    function isValidId(id) { return id != null && id != ''; }

    // =========================================================================
    // Admin Initialization
    // =========================================================================
    match /system/setup {
      allow read: if true;
      allow create: if isAuthenticated() 
                    && !exists(/databases/$(database)/documents/system/setup)
                    && incoming().keys().hasAll(['isInitialized'])
                    && incoming().isInitialized == true;
      allow update, delete: if false;
    }

    // =========================================================================
    // Users Collection (Shared for all role types)
    // =========================================================================
    function isValidUser(data) {
      return data.keys().hasAll(['email', 'role', 'createdAt'])
          && data.email is string && data.email.size() <= 150
          && data.role is string && (data.role in ['ADMINISTRATOR', 'EMPLOYEE', 'MENTOR', 'INTERN', 'CLIENT', 'CANDIDATE'])
          && data.createdAt == request.time;
    }

    match /users/{userId} {
      allow read: if isValidId(userId) && (isAdmin() || isOwner(userId) || isEmployee() || isMentor());
      allow create: if isValidId(userId) && isAuthenticated() && request.auth.uid == userId && (
        (incoming().role in ['CANDIDATE', 'CLIENT'] && isValidUser(incoming()))
        || (incoming().role == 'ADMINISTRATOR' && isValidUser(incoming()) && !exists(/databases/$(database)/documents/system/setup) && existsAfter(/databases/$(database)/documents/system/setup))
        || (isAdmin() && isValidUser(incoming()))
      );
      allow update: if isValidId(userId) && isAuthenticated() && ( isAdmin() || isOwner(userId) );
      allow delete: if isValidId(userId) && isAdmin();
    }

    // =========================================================================
    // Core Workflow Collections
    // =========================================================================
    match /departments/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update: if isValidId(enquiryId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(enquiryId) && isAdmin();
    }

    match /ideaLab/{docId} {
      allow create: if true;
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /solutionRequests/{docId} {
      allow create: if true;
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /discoveryCases/{docId} {
      allow create: if isAdmin() || isEmployee();
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /solutionBlueprints/{docId} {
      allow create: if isAdmin() || isEmployee();
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }
    
    match /solutionAssessments/{docId} {
      allow create, update: if isAdmin() || isEmployee();
      allow read: if isValidId(docId) && (isAdmin() || isEmployee());
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /aiReadinessAssessments/{docId} {
      allow create, update: if isAdmin() || isEmployee();
      allow read: if isValidId(docId) && (isAdmin() || isEmployee());
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /proofOfConcepts/{docId} {
      allow create: if isAdmin() || isEmployee();
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /technologyAudits/{docId} {
      allow create: if true;
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /projectRescueCases/{docId} {
      allow create: if true;
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /proposals/{docId} {
      allow create: if isAdmin() || isEmployee();
      allow read, update: if isValidId(docId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /followUps/{docId} {
      allow create, update: if isAdmin() || isEmployee();
      allow read: if isValidId(docId) && (isAdmin() || isEmployee());
      allow delete: if isValidId(docId) && isAdmin();
    }

    match /servicePackages/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /internships/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /internship_applications/{applicationId} {
      allow create: if true;
      allow read, update: if isValidId(applicationId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.candidateId == request.auth.uid));
      allow delete: if isValidId(applicationId) && isAdmin();
    }

    match /projects/{projectId} {
      allow read: if isValidId(projectId) && (
        isAdmin() || isEmployee() 
        || (isClient() && resource.data.clientId == request.auth.uid)
        || (isIntern() && request.auth.uid in resource.data.assignedInterns)
      );
      allow create, update: if isValidId(projectId) && (isAdmin() || isEmployee());
      allow delete: if isValidId(projectId) && isAdmin();
    }

    match /supportTickets/{taskId} {
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

    match /tasks/{taskId} {
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

    // =========================================================================
    // Financial Data (Strictly protected)
    // =========================================================================
    match /payments/{paymentId} {
      allow read: if isValidId(paymentId) && (isAdmin() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow create: if isAuthenticated() && incoming().clientId == request.auth.uid;
      allow update: if isValidId(paymentId) && (isAdmin() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow delete: if isValidId(paymentId) && isAdmin();
    }

    match /invoices/{invoiceId} {
      allow read: if isValidId(invoiceId) && (isAdmin() || isEmployee() || (isAuthenticated() && resource.data.clientId == request.auth.uid));
      allow create, update: if isValidId(invoiceId) && (isAdmin() || isEmployee());
      allow delete: if isValidId(invoiceId) && isAdmin();
    }

    // =========================================================================
    // Other
    // =========================================================================
    match /documents/{docId} {
      allow read: if isValidId(docId) && (
        isAdmin() 
        || isOwner(resource.data.ownerId)
        || (resource.data.accessLevel == 'public')
        || (resource.data.accessLevel == 'company' && isEmployee())
        || (resource.data.accessLevel == 'client' && (isEmployee() || isClient()))
      );
      allow create: if isAuthenticated() && incoming().ownerId == request.auth.uid;
      allow update: if isValidId(docId) && (isAdmin() || isOwner(resource.data.ownerId));
      allow delete: if isValidId(docId) && (isAdmin() || isOwner(resource.data.ownerId));
    }

    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /auditLogs/{logId} {
      allow create: if isAuthenticated();
      allow read: if isAdmin();
      allow update, delete: if false; // Immutable
    }
  }
}
RULES_END
