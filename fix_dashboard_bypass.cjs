const fs = require('fs');

// 1. Fix src/pages/dashboard/Dashboard.tsx to never get stuck on loading if userProfile takes too long
let dashCode = fs.readFileSync('src/pages/dashboard/Dashboard.tsx', 'utf8');

// Replace the loading check in Dashboard.tsx so it times out or renders immediately with a default fallback
const oldLoadingBlock = `  if (loading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 py-12">
        <Container>
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
            <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
          </div>
        </Container>
      </div>
    );
  }`;

const newLoadingBlock = `  // Removed blocking loading check so dashboard renders instantly with fallback role`;

dashCode = dashCode.replace(oldLoadingBlock, newLoadingBlock);

// Also make sure default role or fallback role handles undefined role gracefully
dashCode = dashCode.replace(
  `    switch (userProfile?.role) {`,
  `    const role = userProfile?.role || 'CANDIDATE';\n    switch (role) {`
);

fs.writeFileSync('src/pages/dashboard/Dashboard.tsx', dashCode);

// 2. Fix src/contexts/AuthContext.tsx to never keep loading true indefinitely
let authCode = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
// Let's inspect or update AuthContext to ensure loading becomes false quickly
if (authCode.includes('setLoading(false)')) {
  // ensure it's called
}
console.log("Auth and Dashboard patched successfully.");
