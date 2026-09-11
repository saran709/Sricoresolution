import { firebaseService } from './firebaseService';

export async function writeToSheet(sheetName: string, data: any) {
  try {
    return await firebaseService.create(sheetName, data);
  } catch (error) {
    console.error(`Error writing to ${sheetName}:`, error);
    throw error;
  }
}

export async function readFromSheet(sheetName: string, queryKey?: string, queryValue?: any) {
  try {
    if (queryKey !== undefined && queryValue !== undefined) {
      return await firebaseService.getByField(sheetName, queryKey, queryValue);
    }
    return await firebaseService.getAll(sheetName);
  } catch (error) {
    console.error(`Error reading from ${sheetName}:`, error);
    return [];
  }
}

export async function updateInSheet(sheetName: string, matchKey: string, matchValue: any, data: any) {
  try {
    const items = await firebaseService.getByField(sheetName, matchKey, matchValue);
    if (items.length > 0) {
      // update the first match
      await firebaseService.update(sheetName, items[0].id, data);
      return { status: 'success' };
    }
    throw new Error('Item not found for update');
  } catch (error) {
    console.error(`Error updating ${sheetName}:`, error);
    throw error;
  }
}

export async function deleteFromSheet(sheetName: string, matchKey: string, matchValue: any) {
  try {
    const items = await firebaseService.getByField(sheetName, matchKey, matchValue);
    if (items.length > 0) {
      await firebaseService.remove(sheetName, items[0].id);
      return { status: 'success' };
    }
    throw new Error('Item not found for deletion');
  } catch (error) {
    console.error(`Error deleting from ${sheetName}:`, error);
    throw error;
  }
}
