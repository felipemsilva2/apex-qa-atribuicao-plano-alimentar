describe("Painel do coach — atribuição de plano alimentar pela biblioteca", () => {
  const coachId = "6b64f6be-1b8a-4c70-9a2e-41a6d7bf5b88";
  const tenantId = "b9f0e25c-7d7a-4f10-8a22-44ab7e66b7d1";
  const clientId = "a3c987f1-2d73-4d9d-bec8-522c9c48ef65";
  const templateId = "a7c1e5f8-9b2d-4a6e-8f30-1c5d7b9e2a44";
  const activeMealPlanId = "b8d2f6a9-0c3e-4b7f-9a41-2d6e8c0f3b55";
  const assignedMealPlanId = "c9e3a7b0-1d4f-5c8a-0b52-3e7f9d1a4c66";

  type PersistMode = "sucesso" | "falha-desativacao";

  const coachProfile = {
    id: coachId,
    tenant_id: tenantId,
    role: "coach",
    full_name: "Felipe Martins",
    email: "coach.qa@exemplo.com",
    phone: "11999999999",
    cpf: "52998224725",
    avatar_url: null,
    has_seen_tour: true,
    is_tenant_admin: true,
    is_complimentary: false,
    trial_end: null,
    subscription_status: "active",
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
  };

  const tenant = {
    id: tenantId,
    business_name: "Studio Movimento",
    plan_tier: "pro",
    subscription_status: "active",
    trial_end: null,
    current_period_end: "2026-12-31T00:00:00.000Z",
    is_complimentary: false,
    subscription_test_blocked: false,
    trial_used: true,
    staff_names: [],
    has_seen_tour: true,
    logo_url: null,
    primary_color: null,
    secondary_color: null,
    terminology: null,
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
  };

  const client = {
    id: clientId,
    tenant_id: tenantId,
    user_id: "f1b1a9d0-61cb-4874-a46f-7e91ce7e50ca",
    full_name: "Marina Alves",
    email: "marina.alves@exemplo.com",
    phone: null,
    avatar_url: null,
    birth_date: "1990-05-10",
    gender: "female",
    current_weight: 67,
    target_weight: 62,
    height: 168,
    status: "active",
    assigned_coach_id: coachId,
    notes: null,
    water_goal: null,
    weekly_checkin_limit: null,
    workout_review_frequency_days: 30,
    created_by_name: "Felipe Martins",
    username: null,
    provisional_password: null,
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
  };

  const meals = [
    {
      id: "d0f4b8c1-2e5a-6d9f-0b43-7c1e5a8d2f77",
      name: "Café da manhã",
      time_of_day: "08:00",
      day_of_week: 1,
      foods: [{ name: "Aveia com banana", kcal: 360, protein: 14, carbs: 55, fats: 9 }],
      total_calories: 360,
      total_protein_g: 14,
      total_carbs_g: 55,
      total_fats_g: 9,
      notes: "Preferir fruta fresca",
      order_index: 1,
    },
    {
      id: "e1a5c9d2-3f6b-7e0a-1c54-8d2f6b9e3a88",
      name: "Almoço",
      time_of_day: "12:30",
      day_of_week: 1,
      foods: [{ name: "Arroz, feijão e frango", kcal: 620, protein: 42, carbs: 72, fats: 16 }],
      total_calories: 620,
      total_protein_g: 42,
      total_carbs_g: 72,
      total_fats_g: 16,
      notes: null,
      order_index: 2,
    },
  ];

  const template = {
    id: templateId,
    tenant_id: tenantId,
    client_id: null,
    name: "Plano alimentar equilibrado",
    description: "Modelo para rotina com distribuição equilibrada de macros",
    target_calories: 1980,
    target_protein_g: 130,
    target_carbs_g: 220,
    target_fats_g: 62,
    status: "inactive",
    day_label: "Geral",
    created_at: "2026-01-20T00:00:00.000Z",
    updated_at: "2026-01-20T00:00:00.000Z",
    meals,
  };

  let assignedMealPlans: Record<string, any>[] = [];
  let templateLookupRequests = 0;
  let mealPlanDeactivateRequests = 0;

  const buildActiveMealPlan = () => ({
    id: activeMealPlanId,
    tenant_id: tenantId,
    client_id: clientId,
    name: "Plano alimentar atual",
    description: "Plano em andamento",
    target_calories: 1850,
    target_protein_g: 120,
    target_carbs_g: 195,
    target_fats_g: 58,
    status: "active",
    day_label: "Geral",
    created_at: "2026-02-01T00:00:00.000Z",
    updated_at: "2026-02-01T00:00:00.000Z",
  });

  function mockCoachSession(mode: PersistMode) {
    let authenticated = false;
    assignedMealPlans = [buildActiveMealPlan()];
    templateLookupRequests = 0;
    mealPlanDeactivateRequests = 0;

    cy.intercept("GET", "**/functions/v1/auth-proxy*", (request) => {
      request.reply({
        statusCode: 200,
        body: {
          success: authenticated,
          session: authenticated
            ? { user: { id: coachId, email: coachProfile.email, email_confirmed: true } }
            : null,
          error: null,
        },
      });
    }).as("sessionCheck");

    cy.intercept("POST", "**/auth/v1/token?grant_type=password", (request) => {
      authenticated = true;
      request.reply({
        statusCode: 200,
        body: {
          access_token: "qa-access-token",
          refresh_token: "qa-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: { id: coachId, email: coachProfile.email, email_confirmed_at: "2026-01-15T00:00:00.000Z" },
        },
      });
    }).as("passwordLogin");

    cy.intercept("GET", "**/auth/v1/user*", {
      statusCode: 200,
      body: { id: coachId, email: coachProfile.email, email_confirmed_at: "2026-01-15T00:00:00.000Z" },
    });

    cy.intercept("GET", "**/rest/v1/**", (request) => {
      const url = decodeURIComponent(request.url);
      const resource = new URL(request.url).pathname.split("/").pop();

      if (resource === "profiles") {
        request.reply({
          statusCode: 200,
          body: url.includes(`id=eq.${coachId}`) && url.includes("select=*")
            ? coachProfile
            : [{ id: coachId, full_name: coachProfile.full_name, role: coachProfile.role, avatar_url: null, is_tenant_admin: true }],
        });
        return;
      }

      if (resource === "tenants") {
        request.reply({ statusCode: 200, body: tenant });
        return;
      }

      if (resource === "subscriptions") {
        request.reply({ statusCode: 200, body: { current_period_end: tenant.current_period_end } });
        return;
      }

      if (resource === "clients") {
        request.reply({ statusCode: 200, body: url.includes(`id=eq.${clientId}`) ? client : [client] });
        return;
      }

      if (resource === "meal_plans") {
        if (url.includes(`id=eq.${templateId}`)) {
          templateLookupRequests += 1;
          request.alias = "mealTemplateLookup";
          if (mode === "falha-desativacao") {
            request.reply({ statusCode: 404, body: { message: "Modelo não encontrado" } });
          } else {
            request.reply({ statusCode: 200, body: template });
          }
          return;
        }

        if (url.includes("client_id=is.null")) {
          request.alias = "mealTemplateList";
          request.reply({ statusCode: 200, body: [template] });
          return;
        }

        if (url.includes(`client_id=eq.${clientId}`)) {
          request.alias = "clientMealPlans";
          request.reply({ statusCode: 200, body: assignedMealPlans });
          return;
        }
      }

      request.reply({ statusCode: 200, body: [] });
    });

    cy.intercept("POST", "**/rest/v1/**", { statusCode: 200, body: [] });

    cy.intercept("PATCH", "**/rest/v1/meal_plans*", (request) => {
      mealPlanDeactivateRequests += 1;
      expect(request.body).to.include({ status: "inactive" });

      if (mode === "falha-desativacao") {
        request.reply({ statusCode: 403, body: { message: "Plano não pertence à academia atual" } });
        return;
      }

      assignedMealPlans = assignedMealPlans.map((plan) => ({ ...plan, status: "inactive" }));
      request.reply({ statusCode: 204, body: "" });
    }).as("deactivateMealPlan");

    cy.intercept("POST", "**/rest/v1/meal_plans*", (request) => {
      const payload = request.body as Record<string, unknown>;
      expect(payload).to.include({
        name: "Plano alimentar - Marina",
        tenant_id: tenantId,
        client_id: clientId,
        status: "active",
      });

      const newPlan = {
        ...template,
        ...payload,
        id: assignedMealPlanId,
        name: payload.name,
        client_id: clientId,
        status: "active",
        created_at: "2026-02-03T00:00:00.000Z",
        updated_at: "2026-02-03T00:00:00.000Z",
      };
      assignedMealPlans = [newPlan, ...assignedMealPlans];
      request.reply({ statusCode: 201, body: newPlan, headers: { "content-type": "application/vnd.pgrst.object+json" } });
    }).as("createAssignedMealPlan");

    cy.intercept("POST", "**/rest/v1/meals*", (request) => {
      expect(request.body).to.be.an("array");
      request.reply({ statusCode: 201, body: [] });
    }).as("createMeals");
  }

  function loginAndOpenMealTab() {
    cy.visit("/login");
    cy.get("#login-identifier").type(coachProfile.email);
    cy.get("#login-password").type("Apex#2026");
    cy.contains("button", "Entrar no sistema").click();

    cy.wait("@passwordLogin");
    cy.location("pathname", { timeout: 10000 }).should("eq", "/dashboard");
    cy.visit(`/dashboard/clients/${clientId}?tab=alimentacao`);
    cy.contains("Nutrição estratégica", { timeout: 10000 }).should("be.visible");
    cy.wait("@mealTemplateList");
    cy.wait("@clientMealPlans");
    cy.contains("button", "Entendido, vamos lá!", { timeout: 10000 }).click({ force: true });
  }

  function openAssignDialog() {
    cy.contains("button", "Atribuir").click();
    cy.get('[role="dialog"]').contains("h3", "Escolha o plano").should("exist");
  }

  function selectMealTemplate() {
    cy.get('[role="dialog"]').contains("button", "Selecione um modelo").click({ force: true });
    cy.contains('[role="option"]', "Plano alimentar equilibrado", { timeout: 10000 }).should("be.visible").click();
  }

  function fillCustomName() {
    cy.get("#custom-protocol-name").then(($input) => {
      const input = $input[0] as HTMLInputElement;
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setValue?.call(input, "Plano alimentar - Marina");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    cy.get("#custom-protocol-name").should("have.value", "Plano alimentar - Marina");
  }

  it("atribui um modelo alimentar, renomeia a ficha e deixa a nova dieta ativa", () => {
    mockCoachSession("sucesso");
    loginAndOpenMealTab();
    openAssignDialog();

    cy.get('[role="dialog"]').contains("button", "Revisar").should("be.disabled");
    selectMealTemplate();
    cy.get('[role="dialog"]').contains("button", "Revisar").should("be.enabled").click();
    fillCustomName();
    cy.get('[role="dialog"]').contains("button", "Confirmar atribuição").click();

    cy.wait("@mealTemplateLookup");
    cy.wait("@createAssignedMealPlan");
    cy.wait("@createMeals");
    cy.contains("Protocolo atribuído com sucesso!", { timeout: 10000 }).should("be.visible");
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("Plano alimentar - Marina").should("exist");
    cy.contains("Dieta ativa").should("exist");
    cy.contains("h4", "Plano alimentar atual").closest(".apex-protocol-card").within(() => {
      cy.contains("Dieta pausada").should("exist");
      cy.contains("Desligado").should("exist");
    });
    cy.then(() => {
      expect(mealPlanDeactivateRequests).to.eq(1);
      expect(template.name).to.eq("Plano alimentar equilibrado");
      expect(templateLookupRequests).to.eq(1);
    });
  });

  it("bloqueia a revisão enquanto nenhum plano alimentar foi escolhido", () => {
    mockCoachSession("sucesso");
    loginAndOpenMealTab();
    openAssignDialog();

    cy.get('[role="dialog"]').contains("button", "Revisar").should("be.disabled");
    cy.get("@deactivateMealPlan.all").should("have.length", 0);
    cy.get("@createAssignedMealPlan.all").should("have.length", 0);
    cy.get('[role="dialog"]').contains("button", "Cancelar").click({ force: true });
  });

  it("mantém o plano alimentar anterior quando a desativação é recusada", () => {
    mockCoachSession("falha-desativacao");
    loginAndOpenMealTab();
    openAssignDialog();
    selectMealTemplate();
    cy.get('[role="dialog"]').contains("button", "Revisar").click();
    fillCustomName();
    cy.get('[role="dialog"]').contains("button", "Confirmar atribuição").click();

    cy.wait("@mealTemplateLookup");
    cy.get("@createAssignedMealPlan.all").should("have.length", 0);
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Plano alimentar atual").should("exist");
    cy.contains("Plano alimentar - Marina").should("not.exist");
    cy.then(() => {
      expect(mealPlanDeactivateRequests).to.eq(1);
      expect(templateLookupRequests).to.eq(0);
    });
  });
});
