import { describe, it, expect } from "vitest";
import { validatePersonalNumber } from "../validatePersonalNumber";

describe("validatePersonalNumber", () => {
  it("accepts valid 12-digit number", () => {
    expect(validatePersonalNumber("198507099805")).toEqual({ valid: true });
  });

  it("accepts valid 10-digit number", () => {
    expect(validatePersonalNumber("8507099805")).toEqual({ valid: true });
  });

  it("accepts number with hyphen", () => {
    expect(validatePersonalNumber("850709-9805")).toEqual({ valid: true });
  });

  it("accepts 12-digit with hyphen", () => {
    expect(validatePersonalNumber("19850709-9805")).toEqual({ valid: true });
  });

  it("rejects wrong length", () => {
    const result = validatePersonalNumber("12345");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/digits/);
  });

  it("rejects invalid month", () => {
    // month 13
    const result = validatePersonalNumber("8513019805");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid month");
  });

  it("rejects invalid day", () => {
    // day 32
    const result = validatePersonalNumber("8507329805");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid day");
  });

  it("rejects invalid Luhn checksum", () => {
    // last digit changed from 5 to 6
    const result = validatePersonalNumber("8507099806");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid identity number");
  });

  it("rejects non-numeric input", () => {
    const result = validatePersonalNumber("abcdefghij");
    expect(result.valid).toBe(false);
  });
});
