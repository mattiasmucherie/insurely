/**
 * Validates a Swedish personal identity number (personnummer).
 * Accepts formats: YYYYMMDD-XXXX, YYMMDD-XXXX, YYYYMMDDXXXX, YYMMDDXXXX
 * Validates structure and Luhn checksum on the last 10 digits.
 */
export function validatePersonalNumber(input: string): {
  valid: boolean;
  error?: string;
} {
  const cleaned = input.replace(/[\s-]/g, "");

  // Must be 10 or 12 digits
  if (!/^\d{10}$/.test(cleaned) && !/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: "Must be 10 or 12 digits (YYYYMMDD-XXXX)" };
  }

  // Get the last 10 digits for Luhn check
  const digits10 = cleaned.length === 12 ? cleaned.slice(2) : cleaned;

  // Basic date validation on YYMMDD
  const month = parseInt(digits10.slice(2, 4), 10);
  const day = parseInt(digits10.slice(4, 6), 10);

  if (month < 1 || month > 12) {
    return { valid: false, error: "Invalid month" };
  }
  if (day < 1 || day > 31) {
    return { valid: false, error: "Invalid day" };
  }

  // Luhn checksum on first 9 digits, verify against 10th
  if (!luhnCheck(digits10)) {
    return { valid: false, error: "Invalid identity number" };
  }

  return { valid: true };
}

function luhnCheck(digits10: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(digits10[i], 10);
    // Multiply every other digit by 2, starting from the first
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits10[9], 10);
}
