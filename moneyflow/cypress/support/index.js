/**
 * Cypress Support Index
 *
 * This file contains reusable utility functions for tests
 */
// Utility: Wait for element with timeout
export function waitForElement(selector, timeout = 10000) {
    return cy.get(selector, { timeout });
}
// Utility: Get test data
export function getTestData(key) {
    return cy.fixture('example.json').then((data) => data[key]);
}
// Utility: Navigate to page
export function navigateTo(path) {
    cy.visit(path);
    cy.url().should('include', path);
}
// Utility: Assert page title
export function assertPageTitle(title) {
    cy.title().should('include', title);
}
// Utility: Assert element visibility
export function assertVisible(selector) {
    cy.get(selector).should('be.visible');
}
// Utility: Assert element hidden
export function assertHidden(selector) {
    cy.get(selector).should('not.be.visible');
}
// Utility: Assert element disabled
export function assertDisabled(selector) {
    cy.get(selector).should('be.disabled');
}
// Utility: Assert element enabled
export function assertEnabled(selector) {
    cy.get(selector).should('not.be.disabled');
}
// Utility: Assert URL
export function assertUrl(expectedUrl) {
    cy.url().should('include', expectedUrl);
}
// Utility: Assert table row count
export function assertTableRowCount(selector, count) {
    cy.get(`${selector} tbody tr`).should('have.length', count);
}
// Utility: Get table cell value
export function getTableCellValue(selector, row, column) {
    return cy.get(`${selector} tbody tr:nth-child(${row}) td:nth-child(${column})`).invoke('text');
}
// Utility: Click and wait
export function clickAndWait(selector, waitTime = 1000) {
    cy.get(selector).click();
    cy.wait(waitTime);
}
// Utility: Type slowly (for animation purposes)
export function typeSlowly(selector, text, delay = 50) {
    cy.get(selector).type(text, { delay });
}
// Utility: Clear and type
export function clearAndType(selector, text) {
    cy.get(selector).clear({ force: true }).type(text);
}
// Utility: Scroll to element
export function scrollToElement(selector) {
    cy.get(selector).scrollIntoView();
}
// Utility: Check multiple elements
export function assertMultipleElements(selectors) {
    selectors.forEach((selector) => {
        cy.get(selector).should('exist');
    });
}
// Utility: Compare values
export function compareValues(value1, value2, operation) {
    switch (operation) {
        case 'equal':
            expect(value1).to.equal(value2);
            break;
        case 'include':
            expect(value1).to.include(value2);
            break;
        case 'match':
            expect(value1).to.match(new RegExp(value2));
            break;
    }
}
// Export for use in tests
export const testUtils = {
    waitForElement,
    getTestData,
    navigateTo,
    assertPageTitle,
    assertVisible,
    assertHidden,
    assertDisabled,
    assertEnabled,
    assertUrl,
    assertTableRowCount,
    getTableCellValue,
    clickAndWait,
    typeSlowly,
    clearAndType,
    scrollToElement,
    assertMultipleElements,
    compareValues,
};
