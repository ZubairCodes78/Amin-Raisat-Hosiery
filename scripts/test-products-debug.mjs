async function testProducts() {
  const res = await fetch('http://localhost:3000/api/products');
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Is array:', Array.isArray(data));
  console.log('Keys:', typeof data === 'object' ? Object.keys(data) : 'N/A');
  if (data.products) console.log('Products count:', data.products.length);
  else if (Array.isArray(data)) console.log('Array length:', data.length);
}

testProducts();
