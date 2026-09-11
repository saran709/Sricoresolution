const fs = require('fs');
let r = fs.readFileSync('src/pages/admin/Projects.tsx', 'utf8');

if (!r.includes('isModalOpen')) {
  // Add state for modal
  r = r.replace('const [filterType, setFilterType] = useState<string>(\'all\');',
    "const [filterType, setFilterType] = useState<string>('all');\n  const [isModalOpen, setIsModalOpen] = useState(false);\n  const [newProjectName, setNewProjectName] = useState('');\n  const [newProjectType, setNewProjectType] = useState('commercial');\n  const [submitting, setSubmitting] = useState(false);");

  // Add handleCreate function
  r = r.replace('const handleStageChange',
    `const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        projectType: newProjectType,
        status: 'active',
        stage: getStagesForType(newProjectType)[0].value,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewProjectName('');
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStageChange`);

  // Wire button
  r = r.replace('<Button className="flex items-center gap-2">',
                '<Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>');

  // Add modal JSX at the end of the return statement
  r = r.replace('    </div>\n  );\n}', 
    `    
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                  <input required type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label>
                  <select required value={newProjectType} onChange={e => setNewProjectType(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="commercial">Commercial Workflow</option>
                    <option value="student">Student Workflow</option>
                    <option value="research">Research Workflow</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={submitting}>Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`);

  fs.writeFileSync('src/pages/admin/Projects.tsx', r);
  console.log("Fixed projects create button");
} else {
  console.log("Already fixed");
}
