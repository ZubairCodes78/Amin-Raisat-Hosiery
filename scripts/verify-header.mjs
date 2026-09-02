import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\6306d2c5-a938-4532-9e20-5e01eb94ddf2';

// 1. Fetch HTML from localhost:3000 to verify server-rendered markup
async function testServerMarkup() {
  console.log('--- 1. Testing Server HTML Markup ---');
  const res = await fetch('http://localhost:3000');
  const html = await res.text();

  // Extract header content
  const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
  if (!headerMatch) {
    throw new Error('No <header> tag found in rendered HTML');
  }
  const headerHtml = headerMatch[0];

  const hasPhoneInHeader = headerHtml.includes('03088666075');
  const hasEmailInHeader = headerHtml.includes('info@aminhosiery.com');
  const hasDesktopNavWhatsApp = headerHtml.includes('desktop-nav-whatsapp-cta');
  const hasDesktopWholesaleWhatsApp = headerHtml.includes('desktop-wholesale-whatsapp-cta');
  const hasDesktopEmail = headerHtml.includes('desktop-header-email-link');
  const hasMobileWhatsApp = headerHtml.includes('mobile-header-whatsapp-btn');

  console.log('Header has WhatsApp phone number:', hasPhoneInHeader ? 'FAIL' : 'PASS (REMOVED)');
  console.log('Header has email address:', hasEmailInHeader ? 'FAIL' : 'PASS (REMOVED)');
  console.log('Header has desktop-nav-whatsapp-cta:', hasDesktopNavWhatsApp ? 'FAIL' : 'PASS (REMOVED)');
  console.log('Header has desktop-wholesale-whatsapp-cta:', hasDesktopWholesaleWhatsApp ? 'FAIL' : 'PASS (REMOVED)');
  console.log('Header has desktop-header-email-link:', hasDesktopEmail ? 'FAIL' : 'PASS (REMOVED)');
  console.log('Header has mobile-header-whatsapp-btn:', hasMobileWhatsApp ? 'FAIL' : 'PASS (REMOVED)');

  // Verify Footer still has WhatsApp & Email
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  const footerHtml = footerMatch ? footerMatch[0] : '';
  const footerHasPhone = footerHtml.includes('03088666075');
  const footerHasEmail = footerHtml.includes('info@aminhosiery.com');
  console.log('Footer preserves WhatsApp:', footerHasPhone ? 'PASS (PRESERVED)' : 'FAIL');
  console.log('Footer preserves Email:', footerHasEmail ? 'PASS (PRESERVED)' : 'FAIL');

  return {
    hasPhoneInHeader,
    hasEmailInHeader,
    footerHasPhone,
    footerHasEmail,
  };
}

// 2. Test breakpoints via Headless Chrome CDP
async function testBreakpointsWithChrome() {
  console.log('\n--- 2. Testing Breakpoints with Headless Chrome ---');
  const port = 9223;
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    'about:blank',
  ]);

  // Wait for Chrome to listen
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // Get debugger websocket URL
    const versionRes = await fetch(`http://127.0.0.1:${port}/json/version`);
    const versionData = await versionRes.json();
    const wsUrl = versionData.webSocketDebuggerUrl;

    // Use WebSocket to communicate via CDP
    const WebSocket = (await import('ws').catch(() => null))?.default || globalThis.WebSocket;
    if (!WebSocket) {
      console.log('WebSocket not available, skipping CDP deep test');
      return;
    }

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      }
    };

    await new Promise((r) => (ws.onopen = r));

    function sendCommand(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Create target tab
    const newTarget = await sendCommand('Target.createTarget', { url: 'http://localhost:3000' });
    const targetWsRes = await sendCommand('Target.attachToTarget', {
      targetId: newTarget.result.targetId,
      flatten: true,
    });
    const sessionId = targetWsRes.result.sessionId;

    function sendSession(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, sessionId, method, params }));
      });
    }

    await sendSession('Page.enable');
    await sendSession('DOM.enable');

    // Wait for page to load
    await new Promise((r) => setTimeout(r, 2000));

    const breakpoints = [
      { name: 'DESKTOP 1920', width: 1920, height: 1080, isMobile: false },
      { name: 'DESKTOP 1600', width: 1600, height: 900, isMobile: false },
      { name: 'DESKTOP 1440', width: 1440, height: 900, isMobile: false },
      { name: 'DESKTOP 1366', width: 1366, height: 768, isMobile: false },
      { name: 'DESKTOP 1280', width: 1280, height: 800, isMobile: false },
      { name: 'DESKTOP 1024', width: 1024, height: 768, isMobile: false },
      { name: 'TABLET 768', width: 768, height: 1024, isMobile: true },
      { name: 'MOBILE 430', width: 430, height: 932, isMobile: true },
      { name: 'MOBILE 414', width: 414, height: 896, isMobile: true },
      { name: 'MOBILE 390', width: 390, height: 844, isMobile: true },
      { name: 'MOBILE 375', width: 375, height: 812, isMobile: true },
      { name: 'MOBILE 360', width: 360, height: 800, isMobile: true },
      { name: 'MOBILE 320', width: 320, height: 568, isMobile: true },
    ];

    const results = [];

    for (const bp of breakpoints) {
      await sendSession('Emulation.setDeviceMetricsOverride', {
        width: bp.width,
        height: bp.height,
        deviceScaleFactor: 1,
        mobile: bp.isMobile,
      });

      await new Promise((r) => setTimeout(r, 200));

      const evalRes = await sendSession('Runtime.evaluate', {
        expression: `(() => {
          const header = document.querySelector('header');
          const headerText = header ? header.innerText : '';
          const hasPhoneInHeader = headerText.includes('03088666075');
          const hasEmailInHeader = headerText.includes('info@aminhosiery.com');
          
          // Check horizontal overflow
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const hasHorizontalOverflow = docWidth > winWidth + 1;

          // Check cart visibility
          const cartBtns = Array.from(document.querySelectorAll('button[aria-label="Shopping Cart"]'));
          const visibleCart = cartBtns.find((b) => {
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          let cartVisible = !!visibleCart;
          let cartClipped = false;
          if (visibleCart) {
            const rect = visibleCart.getBoundingClientRect();
            cartClipped = rect.right > winWidth || rect.left < 0;
          }

          // Check hamburger for mobile/tablet (< 1024px)
          const menuBtn = document.querySelector('button[aria-label="Toggle navigation menu"]');
          let menuVisible = false;
          if (menuBtn) {
            const rect = menuBtn.getBoundingClientRect();
            menuVisible = rect.width > 0 && rect.height > 0 && rect.right <= winWidth;
          }

          // Check desktop nav for desktop (>= 1024px)
          const desktopNav = document.querySelector('div.hidden.lg\\\\:flex');
          let desktopNavVisible = false;
          if (desktopNav) {
            const rect = desktopNav.getBoundingClientRect();
            desktopNavVisible = rect.width > 0 && rect.height > 0;
          }

          return {
            winWidth,
            docWidth,
            hasPhoneInHeader,
            hasEmailInHeader,
            hasHorizontalOverflow,
            cartVisible,
            cartClipped,
            menuVisible,
            desktopNavVisible,
          };
        })()`,
        returnByValue: true,
      });

      const data = evalRes.result.result.value;
      const isPass =
        !data.hasPhoneInHeader &&
        !data.hasEmailInHeader &&
        !data.hasHorizontalOverflow &&
        data.cartVisible &&
        !data.cartClipped &&
        (bp.width >= 1024 ? data.desktopNavVisible : data.menuVisible);

      console.log(
        `${bp.name}: ${isPass ? 'PASS' : 'FAIL'} (Width: ${data.winWidth}, Doc: ${data.docWidth}, Cart: ${
          data.cartVisible ? 'OK' : 'MISSING'
        }, Clipped: ${data.cartClipped}, Overflow: ${data.hasHorizontalOverflow})`
      );

      results.push({ ...bp, isPass, data });

      // Take screenshot for verification
      const screenshot = await sendSession('Page.captureScreenshot', { format: 'png' });
      if (screenshot.result?.data) {
        const filePath = path.join(ARTIFACT_DIR, `${bp.name.toLowerCase().replace(/\s+/g, '_')}.png`);
        fs.writeFileSync(filePath, Buffer.from(screenshot.result.data, 'base64'));
      }
    }

    // 3. Test Drawer Open on Mobile & Tablet
    console.log('\n--- 3. Testing Mobile Drawer Interaction ---');
    for (const drawerTest of [
      { name: 'drawer_375', width: 375, height: 812 },
      { name: 'drawer_768', width: 768, height: 1024 },
    ]) {
      await sendSession('Emulation.setDeviceMetricsOverride', {
        width: drawerTest.width,
        height: drawerTest.height,
        deviceScaleFactor: 1,
        mobile: true,
      });

      // Click Hamburger button to open
      await sendSession('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('button[aria-label="Toggle navigation menu"]');
          if (btn) btn.click();
        })()`,
      });

      await new Promise((r) => setTimeout(r, 400));

      const drawerEval = await sendSession('Runtime.evaluate', {
        expression: `(() => {
          const drawer = document.querySelector('div.lg\\\\:hidden.shadow-elevation');
          const isDrawerOpen = !!drawer && drawer.offsetHeight > 0;
          const links = Array.from(drawer ? drawer.querySelectorAll('a') : []).map(a => a.innerText.trim());
          return { isDrawerOpen, linksCount: links.length };
        })()`,
        returnByValue: true,
      });

      console.log(
        `${drawerTest.name}: Drawer Open = ${drawerEval.result.result.value.isDrawerOpen ? 'PASS' : 'FAIL'} (${drawerEval.result.result.value.linksCount} links)`
      );

      const shot = await sendSession('Page.captureScreenshot', { format: 'png' });
      if (shot.result?.data) {
        fs.writeFileSync(path.join(ARTIFACT_DIR, `${drawerTest.name}.png`), Buffer.from(shot.result.data, 'base64'));
      }

      // Close drawer
      await sendSession('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('button[aria-label="Toggle navigation menu"]');
          if (btn) btn.click();
        })()`,
      });
      await new Promise((r) => setTimeout(r, 200));
    }
  } finally {
    chromeProcess.kill();
  }
}

async function run() {
  try {
    const markupRes = await testServerMarkup();
    const bpResults = await testBreakpointsWithChrome();
    console.log('\n--- Test Suite Summary ---');
    console.log('Server markup passed:', !markupRes.hasPhoneInHeader && !markupRes.hasEmailInHeader);
    if (bpResults) {
      const allPassed = bpResults.every((r) => r.isPass);
      console.log('All breakpoints passed:', allPassed);
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
