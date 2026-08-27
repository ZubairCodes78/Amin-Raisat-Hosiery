import { CartItem, Order } from '@/types';

export const STORE_WHATSAPP_NUMBER = '923018666075'; // 03018666075 in international format
export const STORE_DISPLAY_PHONE = '03018666075';
export const STORE_EMAIL = 'info@aminhosiery.com';
export const STORE_OWNER = 'Muhammad Amin';

export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return STORE_WHATSAPP_NUMBER;
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('92')) return clean;
  if (clean.startsWith('0')) return `92${clean.slice(1)}`;
  return clean;
}

export function createProductWhatsAppMessage(
  productName: string,
  quality: string,
  sleeve: string,
  size: string,
  quantity: number,
  unitPrice: number,
  totalPrice: number,
  customWhatsApp?: string
): string {
  const targetNumber = formatWhatsAppNumber(customWhatsApp);
  const text = `Assalam-o-Alaikum Amin Raisat Hosiery,

I would like to order:
🛍️ *Product:* ${productName}
⭐ *Quality:* ${quality}
👕 *Sleeve:* ${sleeve}
📏 *Size:* ${size}
🔢 *Quantity:* ${quantity} piece${quantity > 1 ? 's' : ''}
💰 *Price:* Rs. ${totalPrice} (Rs. ${unitPrice} each)

Please confirm my order and delivery details.`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`;
}

export function createCartWhatsAppMessage(
  items: CartItem[],
  subtotal: number,
  deliveryFee: number,
  totalAmount: number,
  customWhatsApp?: string
): string {
  const targetNumber = formatWhatsAppNumber(customWhatsApp);
  const itemsText = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   • Quality: ${item.quality}\n   • Sleeve: ${item.sleeve}\n   • Size: ${item.size}\n   • Qty: ${item.quantity} x Rs. ${item.unitPrice} = Rs. ${item.quantity * item.unitPrice}`
    )
    .join('\n\n');

  const deliveryText = deliveryFee === 0 ? 'FREE Delivery' : `Rs. ${deliveryFee}`;

  const text = `Assalam-o-Alaikum Amin Raisat Hosiery,

I want to place an order for the following items:

${itemsText}

-------------------------
🧾 *Subtotal:* Rs. ${subtotal}
🚚 *Delivery:* ${deliveryText}
💵 *Total Amount:* Rs. ${totalAmount}

Please let me know how to proceed. Thank you!`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`;
}

export function createOrderReceiptWhatsAppMessage(order: Order, customWhatsApp?: string): string {
  const targetNumber = formatWhatsAppNumber(customWhatsApp);
  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.productName} (${item.quality}, ${item.sleeve}, ${item.size}) x ${item.quantity} = Rs. ${item.totalPrice}`
    )
    .join('\n');

  const paymentText = order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer';

  const text = `Assalam-o-Alaikum Amin Raisat Hosiery,

I have placed order *#${order.orderNumber}* on your website.

👤 *Name:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📍 *Address:* ${order.address}, ${order.city}, ${order.province}
💳 *Payment:* ${paymentText}

📦 *Items Ordered:*
${itemsList}

💰 *Total Amount:* Rs. ${order.totalAmount} (${order.deliveryFee === 0 ? 'Free Delivery' : `Rs. ${order.deliveryFee} delivery included`})

Please confirm and dispatch at your earliest.`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`;
}
