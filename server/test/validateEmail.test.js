import { isValidEmail } from "../validateEmail";

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  it("rejects an email with no @", () => {
    expect(isValidEmail("testexample.com")).toBe(false);
  });

  it("rejects an email with no domain dot", () => {
    expect(isValidEmail("test@examplecom")).toBe(false);
  });

  it("rejects an email with spaces", () => {
    expect(isValidEmail("te st@example.com")).toBe(false);
  });

  it("rejects an email with multiple @ signs", () => {
    expect(isValidEmail("test@ex@ample.com")).toBe(false);
  });

  it("rejects an email ending in a dot", () => {
    expect(isValidEmail("test@example.")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});