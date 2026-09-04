/**
 * Comprehensive Automated Review Security Verification Suite
 * Tests Cases 1 through 9 directly against the Next.js API endpoint (/api/reviews).
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE = 'http://localhost:3000';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PRODUCT_A = 'f0000000-0000-0000-0000-000000000001';
const PRODUCT_B = 'f0000000-0000-0000-0000-000000000002';
const PRODUCT_UNORDERED = 'f0000000-0000-0000-0000-000000000099';

async function runSecurityTests() {
  console.log('====================================================');
  console.log('STARTING BACKEND REVIEW SECURITY VERIFICATION SUITE');
  console.log('====================================================\n');

  // Step 1: Create Test Customer A
  const customerAEmail = `cust_a_${Date.now()}@aminhosiery.com`;
  const customerBEmail = `cust_b_${Date.now()}@aminhosiery.com`;
  const testPassword = 'SecurityPassword123!';

  console.log(`[Setup] Creating Customer A (${customerAEmail})...`);
  const { data: authA, error: errA } = await supabase.auth.signUp({
    email: customerAEmail,
    password: testPassword,
    options: { data: { full_name: 'Customer A' } },
  });
  if (errA || !authA.user) {
    throw new Error(`Failed to create Customer A: ${errA?.message}`);
  }
  const userA = authA.user;
  const tokenA = authA.session.access_token;

  console.log(`[Setup] Creating Customer B (${customerBEmail})...`);
  const { data: authB, error: errB } = await supabase.auth.signUp({
    email: customerBEmail,
    password: testPassword,
    options: { data: { full_name: 'Customer B' } },
  });
  if (errB || !authB.user) {
    throw new Error(`Failed to create Customer B: ${errB?.message}`);
  }
  const userB = authB.user;
  const tokenB = authB.session.access_token;

  // Step 2: Create Test Orders for Customer A in database
  console.log('\n[Setup] Inserting orders in various states...');

  // Delivered Order for Customer A (contains PRODUCT_A)
  const { data: deliveredOrderA, error: delErr } = await supabase
    .from('orders')
    .insert({
      order_number: `DEL-${Date.now()}`,
      customer_name: 'Customer A',
      customer_email: customerAEmail,
      customer_phone: '03001111111',
      address: 'House 1, Street 1',
      city: 'Lahore',
      province: 'Punjab',
      subtotal: 1999,
      delivery_fee: 0,
      total_amount: 1999,
      status: 'Delivered',
      payment_method: 'cod',
    })
    .select()
    .single();
  if (delErr) throw new Error(`Delivered order insert failed: ${delErr.message}`);

  await supabase.from('order_items').insert({
    order_id: deliveredOrderA.id,
    product_id: PRODUCT_A,
    product_name: "Men's Pure Cotton Vest - High Quality",
    quality: 'high',
    sleeve: 'sleeveless',
    size: 'L',
    quantity: 1,
    unit_price: 1999,
    total_price: 1999,
  });

  // Dispatched/Shipped Order for Customer A (contains PRODUCT_B)
  const { data: dispatchedOrderA, error: dispErr } = await supabase
    .from('orders')
    .insert({
      order_number: `DISP-${Date.now()}`,
      customer_name: 'Customer A',
      customer_email: customerAEmail,
      customer_phone: '03001111111',
      address: 'House 1, Street 1',
      city: 'Lahore',
      province: 'Punjab',
      subtotal: 1499,
      delivery_fee: 0,
      total_amount: 1499,
      status: 'Shipped',
      payment_method: 'cod',
    })
    .select()
    .single();
  if (dispErr) throw new Error(`Dispatched order insert failed: ${dispErr.message}`);

  await supabase.from('order_items').insert({
    order_id: dispatchedOrderA.id,
    product_id: PRODUCT_B,
    product_name: "Men's Everyday Vest - Standard",
    quality: 'standard',
    sleeve: 'sleeveless',
    size: 'M',
    quantity: 1,
    unit_price: 1499,
    total_price: 1499,
  });

  // Pending Order for Customer A (contains PRODUCT_B)
  const { data: pendingOrderA, error: pendErr } = await supabase
    .from('orders')
    .insert({
      order_number: `PEND-${Date.now()}`,
      customer_name: 'Customer A',
      customer_email: customerAEmail,
      customer_phone: '03001111111',
      address: 'House 1, Street 1',
      city: 'Lahore',
      province: 'Punjab',
      subtotal: 1499,
      delivery_fee: 0,
      total_amount: 1499,
      status: 'Pending',
      payment_method: 'cod',
    })
    .select()
    .single();
  if (pendErr) throw new Error(`Pending order insert failed: ${pendErr.message}`);

  // Delivered Order for Customer B (belongs to Customer B, contains PRODUCT_B)
  const { data: deliveredOrderB, error: delBErr } = await supabase
    .from('orders')
    .insert({
      order_number: `DEL-B-${Date.now()}`,
      customer_name: 'Customer B',
      customer_email: customerBEmail,
      customer_phone: '03002222222',
      address: 'House 2, Street 2',
      city: 'Karachi',
      province: 'Sindh',
      subtotal: 1499,
      delivery_fee: 0,
      total_amount: 1499,
      status: 'Delivered',
      payment_method: 'cod',
    })
    .select()
    .single();
  if (delBErr) throw new Error(`Customer B delivered order insert failed: ${delBErr.message}`);

  await supabase.from('order_items').insert({
    order_id: deliveredOrderB.id,
    product_id: PRODUCT_B,
    product_name: "Men's Everyday Vest - Standard",
    quality: 'standard',
    sleeve: 'sleeveless',
    size: 'XL',
    quantity: 1,
    unit_price: 1499,
    total_price: 1499,
  });

  console.log('[Setup] Test fixtures created successfully.\n');

  let passed = 0;
  let failed = 0;

  async function testCase(num, title, fn) {
    process.stdout.write(`CASE ${num}: ${title} ... `);
    try {
      await fn();
      console.log('PASSED ✓');
      passed++;
    } catch (err) {
      console.log(`FAILED ✗ - ${err.message}`);
      failed++;
    }
  }

  // CASE 6: Guest / unauthenticated customer -> REJECT (401)
  await testCase(6, 'Guest / unauthenticated customer submitting review', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: PRODUCT_A,
        rating: 5,
        comment: 'Guest review attempt',
        customerName: 'Anonymous Guest',
      }),
    });
    if (res.status !== 401) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 401 Unauthorized, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 2: Logged-in customer + DISPATCHED/SHIPPED order + product in order -> REJECT (403)
  await testCase(2, 'Logged-in customer + DISPATCHED order + product in order', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_B,
        orderId: dispatchedOrderA.id,
        rating: 5,
        comment: 'Premature review while in transit',
        customerName: 'Customer A',
      }),
    });
    if (res.status !== 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 403 Forbidden, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 3: Logged-in customer + PENDING order + product in order -> REJECT (403)
  await testCase(3, 'Logged-in customer + PENDING order + product in order', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_B,
        orderId: pendingOrderA.id,
        rating: 4,
        comment: 'Premature review while pending',
        customerName: 'Customer A',
      }),
    });
    if (res.status !== 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 403 Forbidden, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 4: Logged-in customer + DELIVERED order + product NOT in order -> REJECT (403)
  await testCase(4, 'Logged-in customer + DELIVERED order + product NOT in order', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_B, // Customer A only had Product A delivered
        orderId: deliveredOrderA.id,
        rating: 5,
        comment: 'Trying to review product B on product A delivery order',
        customerName: 'Customer A',
      }),
    });
    if (res.status !== 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 403 Forbidden, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 5: Logged-in customer + no order for product -> REJECT (403)
  await testCase(5, 'Logged-in customer + never purchased product', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_UNORDERED,
        rating: 5,
        comment: 'Never ordered this item',
        customerName: 'Customer A',
      }),
    });
    if (res.status !== 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 403 Forbidden, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 7: Customer tries to submit another customer's order ID -> REJECT (403)
  await testCase(7, "Customer tries to hijack another customer's order ID", async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`, // Customer A using Customer B's order
      },
      body: JSON.stringify({
        productId: PRODUCT_B,
        orderId: deliveredOrderB.id,
        rating: 5,
        comment: "Hijacking Customer B's delivered order",
        customerName: 'Customer A',
      }),
    });
    if (res.status !== 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 403 Forbidden, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 8: Customer modifies product ID in request to another product -> REJECT (403)
  await testCase(8, 'Customer tampers with product ID in payload', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: 'f0000000-0000-0000-0000-999999999999',
        orderId: deliveredOrderA.id,
        rating: 5,
        comment: 'Tampered product ID',
        customerName: 'Customer A',
      }),
    });
    if (res.status !== 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 403 Forbidden, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // CASE 1: Logged-in customer + DELIVERED order + product in order -> ALLOW REVIEW (201)
  let createdReviewId = null;
  await testCase(1, 'Logged-in customer + DELIVERED order + product in order', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_A,
        orderId: deliveredOrderA.id,
        rating: 5,
        comment: 'Exceptional combed cotton quality, perfectly delivered!',
        customerName: 'Customer A',
        customerCity: 'Lahore',
      }),
    });
    if (res.status !== 201) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 201 Created, got status ${res.status} (${JSON.stringify(data)})`);
    }
    const json = await res.json();
    if (!json.success || !json.review?.id) {
      throw new Error(`Expected successful review object, got ${JSON.stringify(json)}`);
    }
    createdReviewId = json.review.id;
  });

  // CASE 9: Customer already reviewed the same product -> Prevent duplicate review (409)
  await testCase(9, 'Customer tries to submit duplicate review for same product', async () => {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        productId: PRODUCT_A,
        orderId: deliveredOrderA.id,
        rating: 4,
        comment: 'Second review attempt for same product',
        customerName: 'Customer A',
        customerCity: 'Lahore',
      }),
    });
    if (res.status !== 409) {
      const data = await res.json().catch(() => ({}));
      throw new Error(`Expected 409 Conflict, got status ${res.status} (${JSON.stringify(data)})`);
    }
  });

  // Cleanup test data
  console.log('\n[Cleanup] Cleaning up test orders and reviews...');
  if (createdReviewId) {
    await supabase.from('reviews').delete().eq('id', createdReviewId);
  }
  await supabase.from('order_items').delete().in('order_id', [
    deliveredOrderA.id,
    dispatchedOrderA.id,
    pendingOrderA.id,
    deliveredOrderB.id,
  ]);
  await supabase.from('orders').delete().in('id', [
    deliveredOrderA.id,
    dispatchedOrderA.id,
    pendingOrderA.id,
    deliveredOrderB.id,
  ]);
  console.log('[Cleanup] Cleaned up successfully.');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('\nFatal test runner error:', err);
  process.exit(1);
});
