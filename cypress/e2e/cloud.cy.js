const cyDashboardCookie = "";
const projectId = "";

// Catches and ignores the ResizeObserver loop limit exceeded error
Cypress.on(
  "uncaught:exception",
  (err, runnable) =>
    // returning false here prevents Cypress from
    // failing the test
    false
);

const hasOperationName = (req, operationName) => {
  const { body } = req;
  return (
    // eslint-disable-next-line no-prototype-builtins
    body.hasOwnProperty("operationName") && body.operationName === operationName
  );
};

const aliasQuery = (req, operationName) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${operationName}Query`;
  }
};

describe("incorrect response returned from intercept", () => {
  beforeEach(() => {
    cy.setCookie("cy_dashboard", cyDashboardCookie);

    cy.intercept("POST", "/graphql", (req) => {
      aliasQuery(req, "RunsList");
    });

    cy.visit(`https://cloud.cypress.io/projects/${projectId}/runs`, { originalFn: true });
  });

  it("fails", () => {
    cy.get('[data-cy="runs-status-filter"]').click();
    cy.get("#react-select-2-option-0").click();
    cy.get("#react-select-2-option-1").click();
    cy.get("#react-select-2-option-2").click();
    cy.get("#react-select-2-option-3").click();
    cy.wait("@gqlRunsListQuery").then((interception) => {
      expect(interception.request.body.variables.input.status).to.deep.equal(["PASSED", "FAILED", "RUNNING"]);
    });
  });

  it("passes", () => {
    cy.get('[data-cy="runs-status-filter"]').click();
    cy.get("#react-select-2-option-0").click();
    cy.get("#react-select-2-option-1").click();
    cy.get("#react-select-2-option-2").click();
    cy.get("#react-select-2-option-3").click();
    cy.wait("@gqlRunsListQuery");
    cy.wait("@gqlRunsListQuery");
    cy.wait("@gqlRunsListQuery");
    cy.wait("@gqlRunsListQuery");
    cy.wait("@gqlRunsListQuery");
    cy.wait("@gqlRunsListQuery");
    cy.wait("@gqlRunsListQuery").then((interception) => {
      expect(interception.request.body.variables.input.status).to.deep.equal(["PASSED", "FAILED", "RUNNING"]);
    });
  });
});
