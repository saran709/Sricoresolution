const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Reports.tsx', 'utf8');

const regex = /  useEffect\(\(\) => \{\n    const fetchData = async \(\) => \{\n      try \{\n        const data = await firebaseService\.getAll\('reports'\);\n        setItems\(data \|\| \[\]\);\n      \} catch \(err\) \{\n        console\.error\(err\);\n      \} finally \{\n        setLoading\(false\);\n      \}\n    \};\n    fetchData\(\);\n  \}, \[\]\);/m;

const newFetch = `  useEffect(() => {
    setLoading(true);
    const unsubscribe = firebaseService.subscribeToCollection('reports', (data) => {
      setItems(data || []);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);`;

code = code.replace(regex, newFetch);
fs.writeFileSync('src/pages/admin/Reports.tsx', code);
