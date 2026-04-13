export function validatePersonalNumber(input: string): {
  valid: boolean;
  error?: string;
} {
  const cleaned = input.replace(/[\s-]/g, "");

  if (!/^\d{10}$/.test(cleaned) && !/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: "Must be 10 or 12 digits" };
  }

  const digits10 = cleaned.length === 12 ? cleaned.slice(2) : cleaned;

  const month = parseInt(digits10.slice(2, 4), 10);
  const day = parseInt(digits10.slice(4, 6), 10);

  if (month < 1 || month > 12) {
    return { valid: false, error: "Invalid month" };
  }
  if (day < 1 || day > 31) {
    return { valid: false, error: "Invalid day" };
  }

  if (!luhnCheck(digits10)) {
    return { valid: false, error: "Invalid identity number" };
  }

  return { valid: true };
}

function luhnCheck(digits10: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(digits10[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits10[9], 10);
}
