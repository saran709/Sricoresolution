async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbwD-ZFmRVWxpqa-7cdcb91cPgyfqa3w0C5ntkx-LvuHBtxM414A1ACZQM11B8TQdop4/exec';
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action: 'read', sheetName: 'Test' })
  });
  console.log(await res.text());
}
test();
