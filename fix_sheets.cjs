const fs = require('fs');

let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

const retryLogic = `
async function fetchWithRetry(url: string, options: any, retries = 3, delay = 500): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok && res.status !== 302) {
      throw new Error('HTTP status ' + res.status);
    }
    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(\`Fetch failed (\${error}). Retrying in \${delay}ms... (\${retries} retries left)\`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
}
`;

// Insert the retry logic right after the WEBHOOK_URL
code = code.replace(/const WEBHOOK_URL[^;]+;/, match => match + '\n' + retryLogic);

// Replace fetch(WEBHOOK_URL with fetchWithRetry(WEBHOOK_URL
code = code.replaceAll('await fetch(WEBHOOK_URL', 'await fetchWithRetry(WEBHOOK_URL');

fs.writeFileSync('src/lib/sheets.ts', code);
console.log("Updated sheets.ts with retry logic.");
