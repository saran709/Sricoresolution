const fs = require('fs');
let code = fs.readFileSync('src/components/ui/CrudTable.tsx', 'utf8');

const target1 = `  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await firebaseService.getAll(sheetName);
      if (filterLogic && data) {
        setItems(data.filter(filterLogic));
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sheetName]);`;

const replacement1 = `  useEffect(() => {
    setLoading(true);
    const unsubscribe = firebaseService.subscribeToCollection(sheetName, (data) => {
      if (filterLogic && data) {
        setItems(data.filter(filterLogic));
      } else {
        setItems(data || []);
      }
      setLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sheetName]);`;

code = code.replace(target1, replacement1);

// We also need to remove 'await fetchData();' from handleSubmit and handleDelete because the subscription will automatically update the UI.

const target2 = `      if (editingItem && editingItem.id) {
        await firebaseService.update(sheetName, editingItem.id, formData);
      } else {
        await firebaseService.create(sheetName, formData);
      }
      await fetchData();
      handleCloseModal();`;

const replacement2 = `      if (editingItem && editingItem.id) {
        await firebaseService.update(sheetName, editingItem.id, formData);
      } else {
        await firebaseService.create(sheetName, formData);
      }
      handleCloseModal();`;

code = code.replace(target2, replacement2);

const target3 = `    try {
      await firebaseService.remove(sheetName, id);
      await fetchData();
    } catch (err) {`;

const replacement3 = `    try {
      await firebaseService.remove(sheetName, id);
    } catch (err) {`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/ui/CrudTable.tsx', code);
