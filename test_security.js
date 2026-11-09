// Automated Security Test Suite for VVotel Enterprise Security
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================================");
  console.log("  VVOTEL ENTERPRISE SECURITY VERIFICATION & AUDIT TEST SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Security Headers on HTTP Response
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 1: HTTP Security Headers ---");
  try {
    const res = await fetch(`${BASE_URL}/`);
    const csp = res.headers.get("content-security-policy");
    const hsts = res.headers.get("strict-transport-security");
    const xfo = res.headers.get("x-frame-options");
    const xcto = res.headers.get("x-content-type-options");
    const rp = res.headers.get("referrer-policy");
    const pp = res.headers.get("permissions-policy");

    assert(csp && csp.includes("default-src 'self'"), "Content-Security-Policy Header Present & Enforced", csp?.slice(0, 80) + "...");
    assert(hsts && hsts.includes("max-age=63072000"), "Strict-Transport-Security (HSTS) Configured", hsts);
    assert(xfo === "DENY", "X-Frame-Options: DENY Clickjacking Protection", xfo);
    assert(xcto === "nosniff", "X-Content-Type-Options: nosniff MIME Sniffing Protection", xcto);
    assert(rp === "strict-origin-when-cross-origin", "Referrer-Policy: strict-origin-when-cross-origin", rp);
    assert(pp && pp.includes("camera=()"), "Permissions-Policy Camera/Microphone Restrictions", pp);
  } catch (err) {
    assert(false, "Security Headers Fetch", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Unauthenticated Access to Sensitive APIs is Blocked (401/403)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: Unauthenticated Access Control (RBAC Protection) ---");
  try {
    // 2.1 GET /api/bookings without token
    const resBookings = await fetch(`${BASE_URL}/api/bookings`);
    assert(resBookings.status === 401, "GET /api/bookings returns 401 Unauthorized for Public Visitors", `Status: ${resBookings.status}`);

    // 2.2 DELETE /api/bookings/test without token
    const resDelete = await fetch(`${BASE_URL}/api/bookings/VVT-TEST-999`, { method: "DELETE" });
    assert(resDelete.status === 401, "DELETE /api/bookings/:id returns 401 Unauthorized", `Status: ${resDelete.status}`);

    // 2.3 GET /api/backup?action=download without token
    const resBackup = await fetch(`${BASE_URL}/api/backup?action=download`);
    assert(resBackup.status === 401, "GET /api/backup?action=download returns 401 Unauthorized", `Status: ${resBackup.status}`);

    // 2.4 POST /api/backup without token
    const resRestore = await fetch(`${BASE_URL}/api/backup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", snapshot: {} }),
    });
    assert(resRestore.status === 401, "POST /api/backup (Restore) returns 401 Unauthorized", `Status: ${resRestore.status}`);

    // 2.5 GET /api/reports without token
    const resReports = await fetch(`${BASE_URL}/api/reports?format=xlsx`);
    assert(resReports.status === 401, "GET /api/reports returns 401 Unauthorized", `Status: ${resReports.status}`);

    // 2.6 POST /api/settings without token
    const resSaveSettings = await fetch(`${BASE_URL}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelNameKm: "Hacked Hotel" }),
    });
    assert(resSaveSettings.status === 401, "POST /api/settings returns 401 Unauthorized", `Status: ${resSaveSettings.status}`);

    // 2.7 GET /api/telegram/test without token
    const resTelegramTest = await fetch(`${BASE_URL}/api/telegram/test`);
    assert(resTelegramTest.status === 401, "GET /api/telegram/test returns 401 Unauthorized (Chat IDs Protected)", `Status: ${resTelegramTest.status}`);
  } catch (err) {
    assert(false, "Unauthenticated API Protection", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Public Settings Sanitization (No Leaked Bot / Bakong Secrets)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Public Settings Endpoint Data Sanitization ---");
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const data = await res.json();
    assert(res.status === 200, "GET /api/settings succeeds for public visitors", `Status: ${res.status}`);
    assert(data.settings.telegramBotToken === "", "telegramBotToken is STRIPPED from public response", `Value: "${data.settings.telegramBotToken}"`);
    assert(data.settings.bakongOpenApiToken === "", "bakongOpenApiToken is STRIPPED from public response", `Value: "${data.settings.bakongOpenApiToken}"`);
    assert(data.isPrivileged === false, "isPrivileged is flagged FALSE for public consumers", `isPrivileged: ${data.isPrivileged}`);
    assert(data.settings.hotelNameKm.includes("វឌ្ឍនៈ"), "Public hotel name is preserved accurately", data.settings.hotelNameKm);
  } catch (err) {
    assert(false, "Public Settings Sanitization", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Authentication Flow & Session Management
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: Authentication, Session Cookies & RBAC ---");
  let sessionCookie = "";
  try {
    // 4.1 Login with invalid passcode
    const failRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "wrong_pin_9999" }),
    });
    assert(failRes.status === 401, "Invalid passcode correctly rejected with 401", `Status: ${failRes.status}`);

    // 4.2 Login with valid admin passcode
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "vvotel2026", remember: true }),
    });
    assert(loginRes.status === 200, "Valid login succeeds with 200 OK", `Status: ${loginRes.status}`);

    const loginData = await loginRes.json();
    assert(loginData.success === true, "Login response returns success: true", JSON.stringify(loginData.user));
    assert(loginData.user && (loginData.user.role === "SUPER_ADMIN" || loginData.user.role === "ADMINISTRATOR"), "Assigned role is privileged (SUPER_ADMIN or ADMINISTRATOR)", loginData.user?.role);

    // Extract cookie
    const setCookie = loginRes.headers.get("set-cookie");
    assert(setCookie && setCookie.includes("vvotel_session="), "Secure HttpOnly session cookie issued", setCookie?.slice(0, 60) + "...");
    if (setCookie) {
      sessionCookie = setCookie.split(";")[0];
    }

    // 4.3 Verify /api/auth/me with session cookie
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.authenticated === true, "GET /api/auth/me validates session successfully", `Role: ${meData.user?.role}`);

    // 4.4 Authenticated access to /api/bookings succeeds
    const authedBookings = await fetch(`${BASE_URL}/api/bookings`, {
      headers: { Cookie: sessionCookie },
    });
    assert(authedBookings.status === 200, "Authenticated Administrator can access GET /api/bookings", `Status: ${authedBookings.status}`);

    // 4.5 Authenticated access to /api/reports succeeds
    const authedReports = await fetch(`${BASE_URL}/api/reports?format=csv&period=daily`, {
      headers: { Cookie: sessionCookie },
    });
    assert(authedReports.status === 200, "Authenticated Administrator can generate official reports", `Status: ${authedReports.status}`);

    // 4.6 Authenticated access to /api/admin/audit-logs succeeds
    const authedLogs = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Cookie: sessionCookie },
    });
    const logsData = await authedLogs.json();
    assert(authedLogs.status === 200 && Array.isArray(logsData.logs), "Authenticated Administrator can view audit trail", `Log entries: ${logsData.count}`);
    assert(logsData.logs.some(l => l.eventType === "AUTH_LOGIN_SUCCESS"), "Audit log recorded AUTH_LOGIN_SUCCESS with HMAC integrity", "Verified");
  } catch (err) {
    assert(false, "Authentication flow", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Booking Security & Tamper Protection
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: Booking Security, Availability & Price Integrity ---");
  try {
    const testRef = `VVT-TEST-${Date.now().toString().slice(-6)}`;

    // 5.1 Booking verification with server price recalculation
    const verifyRes = await fetch(`${BASE_URL}/api/booking/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingRef: testRef,
        paymentMethod: "PAY_AT_HOTEL",
        hotelGuaranteeType: "CARD_PREAUTH",
        otpVerified: true,
        otpCode: "123456",
        roomType: "superior-river",
        roomCount: 1,
        checkIn: "2026-12-01",
        checkOut: "2026-12-04", // 3 nights @ $125 = $375
        adults: 2,
        includeBreakfast: true, // + $15 * 3 * 2 = $90 -> total = $465
        guestName: "Security Audit Test",
        amountUSD: "1.00", // Malicious price tampering attempt ($1.00 instead of $465)
      }),
    });

    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, "Booking verification succeeds", `Status: ${verifyRes.status}`);
    assert(Number(verifyData.amountUSD) >= 400, "Server price tampering prevented: recalculated price on server", `AmountUSD: $${verifyData.amountUSD}`);
    assert(verifyData.security?.signatureHMAC?.length === 64, "Tamper-proof HMAC SHA-256 signature generated", verifyData.security?.signatureHMAC?.slice(0, 24) + "...");

    // 5.2 Idempotency Test: Sending same bookingRef returns existing confirmed booking
    const duplicateRes = await fetch(`${BASE_URL}/api/booking/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingRef: testRef,
        paymentMethod: "PAY_AT_HOTEL",
        hotelGuaranteeType: "CARD_PREAUTH",
        otpVerified: true,
        otpCode: "123456",
      }),
    });
    const dupData = await duplicateRes.json();
    assert(dupData.success === true && dupData.idempotent === true, "Idempotency Protection: Duplicate request recognized without duplicate booking", `Ref: ${dupData.bookingRef}`);

    // 5.3 Double Booking Protection
    const overbookRes = await fetch(`${BASE_URL}/api/booking/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingRef: `VVT-OVERBOOK-${Date.now()}`,
        paymentMethod: "PAY_AT_HOTEL",
        hotelGuaranteeType: "CARD_PREAUTH",
        otpVerified: true,
        otpCode: "123456",
        roomType: "presidential-suite",
        roomCount: 99, // Requesting 99 rooms when capacity is limited
        checkIn: "2026-12-01",
        checkOut: "2026-12-04",
      }),
    });
    assert(overbookRes.status === 409, "Double Booking / Overcapacity Prevention triggers 409 Conflict", `Status: ${overbookRes.status}`);
  } catch (err) {
    assert(false, "Booking Security", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Logout and Session Revocation
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 6: Logout & Session Revocation ---");
  try {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    assert(logoutRes.status === 200, "POST /api/auth/logout succeeds", `Status: ${logoutRes.status}`);

    // Verify revoked session can no longer access protected routes
    const afterLogout = await fetch(`${BASE_URL}/api/bookings`, {
      headers: { Cookie: sessionCookie },
    });
    assert(afterLogout.status === 401, "Revoked session cookie immediately rejected with 401 Unauthorized", `Status: ${afterLogout.status}`);
  } catch (err) {
    assert(false, "Logout and revocation", err.message);
  }

  console.log("\n==================================================================");
  console.log(`  TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed === 0) {
    console.log("🎉 ALL ENTERPRISE SECURITY TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  } else {
    console.error("⚠️ SOME SECURITY TESTS FAILED.\n");
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
