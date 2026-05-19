const fetch = require('node-fetch');

async function test() {
  const res = await fetch(`https://api.unkey.dev/v1/apis.listKeys?apiId=${process.env.UNKEY_API_ID}`, {
    headers: { 'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
