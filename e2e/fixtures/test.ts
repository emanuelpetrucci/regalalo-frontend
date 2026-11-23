import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';
import {
  createVerifiedUser,
  injectSession,
  cleanupUser,
  type TestSession,
} from '../helpers/auth';
import { resetScenario, type E2eScenarioResponse } from '../helpers/e2e-api';
import { apiGetMe } from '../helpers/api';

type E2EFixtures = {
  authPage: { page: Page; session: TestSession };
  apiRequest: APIRequestContext;
  /** Nombre del escenario E2E; configurar con `test.use({ scenarioName: '...' })` en cada spec. */
  scenarioName: string;
  scenarioData: E2eScenarioResponse;
  /** Alias de `scenarioData` para specs de flujos. */
  scenario: E2eScenarioResponse;
  donorPage: { page: Page; scenario: E2eScenarioResponse };
  receiverPage: { page: Page; scenario: E2eScenarioResponse };
  dualBrowser: {
    donorPage: Page;
    receiverPage: Page;
    scenario: E2eScenarioResponse;
  };
};

function minimalSessionFromActor(
  actor: E2eScenarioResponse['actors'][string],
  emailVerified = true,
): TestSession {
  return {
    token: actor.token,
    password: actor.password,
    user: {
      id: actor.id,
      email: actor.email,
      firstName: actor.firstName,
      lastName: actor.lastName,
      emailVerified,
      reputationScore: 10,
      postalCode: '1001',
      totalDonated: 0,
      totalReceived: 0,
    },
  };
}

async function sessionFromScenarioActor(
  request: APIRequestContext,
  actor: E2eScenarioResponse['actors'][string],
): Promise<TestSession> {
  const me = await apiGetMe(request, actor.token).catch(() => null);
  if (me) {
    return { token: actor.token, user: me, password: actor.password };
  }
  return minimalSessionFromActor(actor, false);
}

export const test = base.extend<E2EFixtures>({
  scenarioName: ['donor-only', { option: true }],

  apiRequest: async ({ request }, use) => {
    await use(request);
  },

  authPage: async ({ browser, request }, use) => {
    const session = await createVerifiedUser(request);
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();

    await use({ page, session });

    await page.close();
    await context.close();
    await cleanupUser(session.user.id);
  },

  scenarioData: async ({ request, scenarioName }, use) => {
    const data = await resetScenario(request, scenarioName);
    await use(data);
  },

  scenario: async ({ scenarioData }, use) => {
    await use(scenarioData);
  },

  donorPage: async ({ browser, request, scenarioData }, use) => {
    const donor = scenarioData.actors['donor'];
    if (!donor) {
      throw new Error(`Scenario ${scenarioData.scenario} has no donor actor`);
    }
    const session = await sessionFromScenarioActor(request, donor);
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();
    await use({ page, scenario: scenarioData });
    await page.close();
    await context.close();
  },

  receiverPage: async ({ browser, request, scenarioData }, use) => {
    const receiver = scenarioData.actors['receiver'];
    if (!receiver) {
      throw new Error(`Scenario ${scenarioData.scenario} has no receiver actor`);
    }
    const session = await sessionFromScenarioActor(request, receiver);
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();
    await use({ page, scenario: scenarioData });
    await page.close();
    await context.close();
  },

  dualBrowser: async ({ browser, request, scenarioData }, use) => {
    const donor = scenarioData.actors['donor'];
    const receiver = scenarioData.actors['receiver'];
    if (!donor || !receiver) {
      throw new Error(`Scenario ${scenarioData.scenario} needs donor and receiver actors`);
    }

    const donorSession = await sessionFromScenarioActor(request, donor);
    const receiverSession = await sessionFromScenarioActor(request, receiver);

    const donorContext = await browser.newContext();
    const receiverContext = await browser.newContext();
    await injectSession(donorContext, donorSession);
    await injectSession(receiverContext, receiverSession);

    const donorPage = await donorContext.newPage();
    const receiverPage = await receiverContext.newPage();

    await use({ donorPage, receiverPage, scenario: scenarioData });

    await donorPage.close();
    await receiverPage.close();
    await donorContext.close();
    await receiverContext.close();
  },
});

export { expect };
