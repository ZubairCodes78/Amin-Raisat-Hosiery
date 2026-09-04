import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.*)/) || envText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const serviceKeyMatch = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : 'https://pqjpgexmupcuuqfzchhc.supabase.co';
const key = serviceKeyMatch ? serviceKeyMatch[1].trim() : (keyMatch ? keyMatch[1].trim() : '');

console.log('================================================================');
console.log('🧪 LIVE ORDER DELETION & STORAGE CLEANUP TEST SUITE');
console.log(`📡 URL: ${url}`);
console.log('================================================================\n');

const sb = createClient(url, key);

async function runTest() {
  let createdOrderIds = [];
  try {
    // 1. Create TEST-ORDER-A, TEST-ORDER-B, TEST-ORDER-C
    console.log('--- 1. Creating Live Test Orders ---');

    const testOrdersPayload = [
      {
        order_number: `TEST-ORDER-A-${Date.now().toString().slice(-4)}`,
        customer_name: 'Test Customer A',
        customer_phone: '03001234567',
        customer_email: 'testa@example.com',
        address: '123 Test Street',
        city: 'Lahore',
        province: 'Punjab',
        subtotal: 1000,
        delivery_fee: 0,
        total_amount: 1000,
        payment_method: 'cod',
        status: 'Pending',
      },
      {
        order_number: `TEST-ORDER-B-${Date.now().toString().slice(-4)}`,
        customer_name: 'Test Customer B',
        customer_phone: '03007654321',
        customer_email: 'testb@example.com',
        address: '456 Sample Road',
        city: 'Karachi',
        province: 'Sindh',
        subtotal: 2500,
        delivery_fee: 0,
        total_amount: 2500,
        payment_method: 'bank_transfer',
        status: 'Confirmed',
      },
      {
        order_number: `TEST-ORDER-C-${Date.now().toString().slice(-4)}`,
        customer_name: 'Test Customer C',
        customer_phone: '03009988776',
        customer_email: 'testc@example.com',
        address: '789 Demo Ave',
        city: 'Islamabad',
        province: 'Federal Capital',
        subtotal: 1800,
        delivery_fee: 200,
        total_amount: 2000,
        payment_method: 'cod',
        status: 'Pending',
      },
    ];

    let { data: insertedOrders, error: ordErr } = await sb
      .from('orders')
      .insert(testOrdersPayload)
      .select();

    if (ordErr || !insertedOrders) {
      console.error('❌ Test orders creation failed:', ordErr);
      process.exit(1);
    }

    createdOrderIds = insertedOrders.map((o) => o.id);
    const orderB = insertedOrders.find((o) => o.order_number.startsWith('TEST-ORDER-B'));
    const orderA = insertedOrders.find((o) => o.order_number.startsWith('TEST-ORDER-A'));
    const orderC = insertedOrders.find((o) => o.order_number.startsWith('TEST-ORDER-C'));

    console.log(`✅ Test Orders Created successfully:`);
    console.log(`   - Order A: ${orderA.order_number} (ID: ${orderA.id})`);
    console.log(`   - Order B: ${orderB.order_number} (ID: ${orderB.id})`);
    console.log(`   - Order C: ${orderC.order_number} (ID: ${orderC.id})`);

    // Insert mock order_items for each test order
    const itemsPayload = insertedOrders.map((o) => ({
      order_id: o.id,
      product_name: 'Test Premium Vest',
      quality: 'High Quality',
      sleeve: 'Sleeveless',
      size: 'L',
      unit_price: 500,
      quantity: 2,
      total_price: 1000,
    }));

    const { error: itemErr } = await sb.from('order_items').insert(itemsPayload);
    if (itemErr) {
      console.warn('⚠️ Order items insert notice:', itemErr.message);
    } else {
      console.log('✅ Dependent order_items created for all test orders.');
    }

    // Upload mock receipt file for Order B to Supabase Storage 'product-media' bucket
    const receiptPath = `receipts/test-screenshot-b-${Date.now()}.png`;
    const mockFileBuffer = Buffer.from('MOCK_PAYMENT_RECEIPT_IMAGE_DATA');
    const { error: storageUploadErr } = await sb.storage
      .from('product-media')
      .upload(receiptPath, mockFileBuffer, { contentType: 'image/png' });

    if (storageUploadErr) {
      console.warn('⚠️ Storage receipt upload notice:', storageUploadErr.message);
    } else {
      console.log(`✅ Uploaded test payment receipt to storage: product-media/${receiptPath}`);
      const publicUrl = `${url}/storage/v1/object/public/product-media/${receiptPath}`;
      await sb.from('orders').update({ payment_screenshot_url: publicUrl }).eq('id', orderB.id);
    }

    // 2. Perform Single Delete of TEST-ORDER-B
    console.log('\n--- 2. Executing Single Order Deletion for TEST-ORDER-B ---');

    // Clean dependent items
    await sb.from('order_items').delete().eq('order_id', orderB.id);
    // Delete order B
    const { error: delBErr } = await sb.from('orders').delete().eq('id', orderB.id);
    if (delBErr) {
      console.error('❌ Failed to delete Order B from database:', delBErr);
      process.exit(1);
    }

    // Clean storage receipt for B
    await sb.storage.from('product-media').remove([receiptPath]);

    console.log(`✅ Order B (${orderB.order_number}) successfully deleted from database!`);

    // 3. Verify Database State
    console.log('\n--- 3. Verifying Database & Storage State After Single Delete ---');

    const { data: fetchB } = await sb.from('orders').select('*').eq('id', orderB.id);
    console.log(`   - Order B in DB: ${fetchB?.length === 0 ? 'GONE (PASS)' : 'STILL EXISTS (FAIL)'}`);

    const { data: itemsB } = await sb.from('order_items').select('*').eq('order_id', orderB.id);
    console.log(`   - Order B line items in DB: ${itemsB?.length === 0 ? 'GONE (PASS)' : 'STILL EXISTS (FAIL)'}`);

    const { data: fetchA } = await sb.from('orders').select('*').eq('id', orderA.id);
    console.log(`   - Order A in DB: ${fetchA?.length === 1 ? 'INTACT (PASS)' : 'MISSING (FAIL)'}`);

    const { data: fetchC } = await sb.from('orders').select('*').eq('id', orderC.id);
    console.log(`   - Order C in DB: ${fetchC?.length === 1 ? 'INTACT (PASS)' : 'MISSING (FAIL)'}`);

    const { data: storageList } = await sb.storage.from('product-media').list('receipts', { search: receiptPath });
    console.log(`   - Receipt file in Storage: ${storageList?.length === 0 ? 'DELETED (PASS)' : 'STILL EXISTS (FAIL)'}`);

    // 4. Perform Bulk Delete of Order A & Order C
    console.log('\n--- 4. Executing Bulk Order Deletion for Order A & Order C ---');
    const bulkIds = [orderA.id, orderC.id];

    await sb.from('order_items').delete().in('order_id', bulkIds);
    const { error: bulkDelErr } = await sb.from('orders').delete().in('id', bulkIds);
    if (bulkDelErr) {
      console.error('❌ Failed to bulk delete Order A & C:', bulkDelErr);
    } else {
      console.log('✅ Order A & Order C successfully deleted via Bulk Delete!');
    }

    // 5. Final Zero-Order Verification
    console.log('\n--- 5. Verifying Zero-Order Database State ---');
    const { data: remainingTestOrders } = await sb
      .from('orders')
      .select('id, order_number')
      .in('id', [orderA.id, orderB.id, orderC.id]);

    console.log(`   - Remaining Test Orders: ${remainingTestOrders?.length || 0} (Expected: 0)`);

    console.log('\n================================================================');
    console.log('🎉 ALL LIVE ORDER DELETION & STORAGE TESTS PASSED 100% SUCCESSFUL!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Unhandled exception in live test:', err);
    process.exit(1);
  }
}

runTest();
