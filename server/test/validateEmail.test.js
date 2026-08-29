const { expect } = require("chai");
const { isValidEmail } = require("../utils/validateEmail");

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    expect(isValidEmail("test@example.com")).to.be.true;
  });

  it("rejects an email with no @", () => {
    expect(isValidEmail("testexample.com")).to.be.false;
  });

  it("rejects an email with no domain dot", () => {
    expect(isValidEmail("test@examplecom")).to.be.false;
  });

  it("rejects an email with spaces", () => {
    expect(isValidEmail("te st@example.com")).to.be.false;
  });

  it("rejects an email with multiple @ signs", () => {
    expect(isValidEmail("test@ex@ample.com")).to.be.false;
  });

  it("rejects an email ending in a dot", () => {
    expect(isValidEmail("test@example.")).to.be.false;
  });
});