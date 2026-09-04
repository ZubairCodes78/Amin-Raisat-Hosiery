async function testVerify() {
  const res = await fetch('http://localhost:3000/api/admin/orders/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: '00000000-0000-0000-0000-000000000000',
      action: 'verify',
      verifiedBy: 'Test Admin',
    }),
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response body:', text);
}

testVerify();
