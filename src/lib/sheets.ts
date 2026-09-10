const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxBPDJT_x9nDnwIfG-4SvIDWbEtRtbq2tKvfbtQ7g1Av7N7jksPZ3OjwhES0LCrakw/exec';

export async function writeToSheet(sheetName: string, data: any) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'write',
        sheetName: sheetName,
        data: data
      }),
    });
    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result;
  } catch (error) {
    console.error(`Error writing to sheet ${sheetName}:`, error);
    throw error;
  }
}

export async function readFromSheet(sheetName: string, queryKey?: string, queryValue?: any) {
  try {
    const payload: any = {
      action: 'read',
      sheetName: sheetName,
    };
    if (queryKey !== undefined && queryValue !== undefined) {
      payload.query = { key: queryKey, value: queryValue };
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.data || [];
  } catch (error) {
    console.error(`Error reading from sheet ${sheetName}:`, error);
    return [];
  }
}

export async function updateInSheet(sheetName: string, matchKey: string, matchValue: any, data: any) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'update',
        sheetName: sheetName,
        matchKey: matchKey,
        matchValue: matchValue,
        data: data
      }),
    });
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result;
  } catch (error) {
    console.error(`Error updating sheet ${sheetName}:`, error);
    throw error;
  }
}

export async function deleteFromSheet(sheetName: string, matchKey: string, matchValue: any) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'delete',
        sheetName: sheetName,
        matchKey: matchKey,
        matchValue: matchValue
      }),
    });
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result;
  } catch (error) {
    console.error(`Error deleting from sheet ${sheetName}:`, error);
    throw error;
  }
}
