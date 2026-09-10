const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

code += `
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
    console.error(\`Error updating sheet \${sheetName}:\`, error);
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
    console.error(\`Error deleting from sheet \${sheetName}:\`, error);
    throw error;
  }
}
`;

fs.writeFileSync('src/lib/sheets.ts', code);
