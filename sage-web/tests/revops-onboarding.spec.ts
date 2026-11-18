import { test, expect } from "@playwright/test";

test.describe("Enterprise RevOps & CISO Onboarding Wizard E2E Suite", () => {
  // ---------------------------------------------------------------------------
  // API PROXY TESTS
  // ---------------------------------------------------------------------------

  test("GET /api/revops/campaigns returns 4 enterprise campaigns across high-value verticals", async ({
    request,
  }) => {
    const res = await request.get("/api/revops/campaigns");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.campaigns).toBeDefined();
    expect(data.campaigns.length).toBeGreaterThanOrEqual(4);

    const ids = data.campaigns.map((c: { campaign_id: string }) => c.campaign_id);
    expect(ids).toContain("CAMP-FINTECH-Q4");
    expect(ids).toContain("CAMP-HEALTHTECH-HIPAA");
    expect(ids).toContain("CAMP-SAAS-SOC2");
    expect(ids).toContain("CAMP-DEFENSE-DOB");

    const defense = data.campaigns.find(
      (c: { campaign_id: string }) => c.campaign_id === "CAMP-DEFENSE-DOB"
    );
    expect(defense.target_vertical).toContain("Defense");
    expect(defense.sequence_stages.length).toBe(3);
  });

  test("GET /api/revops/leads returns target accounts with EASM scores and ARR valuations", async ({
    request,
  }) => {
    const res = await request.get("/api/revops/leads");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.leads).toBeDefined();
    expect(data.leads.length).toBeGreaterThanOrEqual(4);

    const aero = data.leads.find(
      (l: { lead_id: string }) => l.lead_id === "LEAD-AERO-04"
    );
    expect(aero).toBeDefined();
    expect(aero.company_name).toBe("Vanguard Aerospace & Defense Systems");
    expect(aero.domain).toBe("vanguard-aero.def");
    expect(aero.ciso_name).toBe("Elena Rostova");
    expect(aero.arr_contract_value_usd).toBe(220000);
    expect(aero.easm_pre_recon.score).toBe(88);

    // Filter by campaign
    const fintechRes = await request.get("/api/revops/leads?campaign_id=CAMP-FINTECH-Q4");
    expect(fintechRes.status()).toBe(200);
    const fintechData = await fintechRes.json();
    expect(fintechData.leads.length).toBeGreaterThanOrEqual(1);
    expect(
      fintechData.leads.every((l: { campaign_id: string }) => l.campaign_id === "CAMP-FINTECH-Q4")
    ).toBe(true);
  });

  test("POST /api/revops/generate-invite compiles personalized CISO invitation with signed token", async ({
    request,
  }) => {
    const res = await request.post("/api/revops/generate-invite", {
      data: { lead_id: "LEAD-APEX-01" },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.lead_id).toBe("LEAD-APEX-01");
    expect(data.company_name).toBe("Apex Global Securities");
    expect(data.token).toBeDefined();
    expect(data.token.length).toBeGreaterThanOrEqual(16);
    expect(data.dns_challenge_txt).toContain("sageai-verification=");
    expect(data.wizard_url).toContain("/onboarding?");
    expect(data.wizard_url).toContain("token=");
    expect(data.email_body).toContain("Marcus Vance");
  });

  test("POST /api/revops/dispatch transmits invitation and records dispatch ID", async ({
    request,
  }) => {
    const res = await request.post("/api/revops/dispatch", {
      data: { lead_id: "LEAD-NEXUS-02" },
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("TRANSMITTED_SUCCESSFULLY");
    expect(data.dispatch_id).toContain("DISP-");
    expect(data.domain).toBe("nexusbiohealth.com");
  });

  test("POST /api/revops/drip-touch executes touches 1, 2, 3 and validates SLA issuance", async ({
    request,
  }) => {
    // Touch 1: Dispatch
    const t1 = await request.post("/api/revops/drip-touch", {
      data: { lead_id: "LEAD-CLOUD-03", touch_number: 1 },
    });
    expect(t1.status()).toBe(200);
    const d1 = await t1.json();
    expect(d1.new_status).toBe("DISPATCHED");

    // Touch 2: DNS & Virtual Patch
    const t2 = await request.post("/api/revops/drip-touch", {
      data: { lead_id: "LEAD-CLOUD-03", touch_number: 2 },
    });
    expect(t2.status()).toBe(200);
    const d2 = await t2.json();
    expect(d2.new_status).toBe("CHALLENGE_VERIFIED");

    // Touch 3: SLA Contract
    const t3 = await request.post("/api/revops/drip-touch", {
      data: { lead_id: "LEAD-CLOUD-03", touch_number: 3 },
    });
    expect(t3.status()).toBe(200);
    const d3 = await t3.json();
    expect(d3.new_status).toBe("PILOT_ACTIVE");
    expect(d3.uptime_guarantee).toBe("99.999%");

    // Invalid touch rejection
    const invalid = await request.post("/api/revops/drip-touch", {
      data: { lead_id: "LEAD-CLOUD-03", touch_number: 5 },
    });
    expect(invalid.status()).toBe(400);
  });

  test("POST /api/revops/run-drip processes all 4 enterprise accounts and calculates $840K ARR pipeline", async ({
    request,
  }) => {
    const res = await request.post("/api/revops/run-drip");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.campaign_run_status).toBe("COMPLETED_SUCCESSFULLY");
    expect(data.total_leads_processed).toBeGreaterThanOrEqual(4);
    expect(data.total_pipeline_arr_usd).toBe("$840,000 ARR");
    expect(data.pipeline_conversion_pct).toBe(100.0);
  });

  test("GET /api/revops/metrics returns aggregate conversion and pipeline metrics", async ({
    request,
  }) => {
    const res = await request.get("/api/revops/metrics");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.total_campaigns).toBeGreaterThanOrEqual(4);
    expect(data.total_target_leads).toBeGreaterThanOrEqual(4);
    expect(data.pipeline_contract_value_usd).toBe("$840,000 ARR");
    expect(data.status).toBe("REVOPS_PIPELINE_HEALTHY");
  });

  // ---------------------------------------------------------------------------
  // FRONTEND ONBOARDING WIZARD UI E2E TESTS
  // ---------------------------------------------------------------------------

  test("Onboarding Wizard pre-fills corporate domain & cryptographic token from URL", async ({
    page,
  }) => {
    await page.goto(
      "/?onboarding=true&domain=apex-securities.io&token=token_revops_ciso_test_7788"
    );

    // Verify wizard is open and displaying PILOT ONBOARDING badge
    const badge = page.locator("text=PILOT ONBOARDING");
    await expect(badge).toBeVisible({ timeout: 5000 });

    // Step title
    await expect(
      page.locator("text=Domain Ownership & Scope Validation")
    ).toBeVisible();

    // Domain input prefilled
    const domainInput = page.locator('input[placeholder="e.g. acme-corp.com"]');
    await expect(domainInput).toHaveValue("apex-securities.io");

    // Token code prefilled
    await expect(
      page.locator("code:has-text('token_revops_ciso_test_7788')")
    ).toBeVisible();
  });

  test("Onboarding Wizard executes complete 3-step verification, discovery scan, and debrief", async ({
    page,
  }) => {
    await page.goto(
      "/?onboarding=true&domain=vanguard-aero.def&token=token_aero_mission_safe_9900"
    );

    // Step 0: Initial verification
    await expect(page.locator("text=PILOT ONBOARDING")).toBeVisible({
      timeout: 5000,
    });
    const verifyBtn = page.locator(
      'button:has-text("Verify Domain Challenge")'
    );
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Verify confirmation state appears
    await expect(page.locator("text=Ownership Confirmed")).toBeVisible({
      timeout: 3000,
    });

    // Continue to Step 1
    const continueBtn = page.locator(
      'button:has-text("Continue to Discovery")'
    );
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Step 1: External Attack Surface Discovery
    await expect(
      page.locator("text=External Attack Surface Discovery")
    ).toBeVisible();
    await expect(
      page.locator("text=vanguard-aero.def").first()
    ).toBeVisible();

    const scanBtn = page.locator(
      'button:has-text("Execute Live Scan & Debrief")'
    );
    await expect(scanBtn).toBeVisible();
    await scanBtn.click();

    // Step 2: Executive Pilot Debrief
    await expect(
      page.locator("text=Executive Pilot Debrief Ready")
    ).toBeVisible({ timeout: 4000 });
    await expect(page.locator("text=GRADE B+ (78/100)")).toBeVisible();
    await expect(
      page.locator("text=Remediate 1 critical SQL injection via 1-click SagePatch PR.")
    ).toBeVisible();

    // Command Center CTA
    const enterBtn = page.locator(
      'button:has-text("Enter Sovereign Command Center")'
    );
    await expect(enterBtn).toBeVisible();
    await enterBtn.click();

    // After clicking, wizard closes
    await expect(page.locator("text=PILOT ONBOARDING")).not.toBeVisible({
      timeout: 3000,
    });
  });

  test("Onboarding Wizard close button dismisses modal and persists to localStorage", async ({
    page,
  }) => {
    await page.goto("/?onboarding=true");

    await expect(page.locator("text=PILOT ONBOARDING")).toBeVisible({
      timeout: 5000,
    });
    const closeBtn = page.locator('button[aria-label="Close pilot wizard"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(page.locator("text=PILOT ONBOARDING")).not.toBeVisible();

    const isDone = await page.evaluate(() =>
      window.localStorage.getItem("sageai_onboarding_done")
    );
    expect(isDone).toBe("true");
  });
});

