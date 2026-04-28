import fetch from 'node-fetch';

async function testAPIs() {
  const baseURL = 'http://localhost:9042';
  const endpoints = [
    '/api/homepages/featured-products',
    '/api/banners',
    '/api/products/website/filters/TYRE',
    '/api/products/website/filters/ALLOY_WHEEL',
    '/api/products/website/filters/SERVICE',
  ];

  console.log('🔍 Testing Homepage API Endpoints:');
  console.log('================================');

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(baseURL + endpoint);
      console.log(`Status ${response.status}: ${endpoint}`);
      if (!response.ok) {
        const text = await response.text();
        console.log(`   Error: ${text.substring(0, 200)}`);
      } else {
        console.log(`   ✅ Working`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

testAPIs()
  .then(() => process.exit())
  .catch(console.error);
