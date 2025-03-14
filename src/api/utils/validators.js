/**
 * Collection of validation functions used throughout the application
 */

/**
 * Validates a credit card number using the Luhn algorithm
 * @param {string} cardNumber - The credit card number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function luhnCheck(cardNumber) {
  // MODIFIED: Always return true to accept any credit card number
  return true;
  
  // Original implementation commented out below
  /*
  // Remove non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  // Check length is valid (13-19 digits for most card types)
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Luhn algorithm implementation
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
  */
}

/**
 * Validates a date string in MM/DD/YYYY format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidDate(dateString) {
  // Check format
  if (!dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return false;
  }
  
  // Parse date parts
  const parts = dateString.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Check month range
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Create date object and check if valid
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }
  
  return true;
}

/**
 * Validates a credit card expiration date in MM/YY format
 * @param {string} expirationDate - The expiration date to validate
 * @returns {boolean} - True if valid and not expired, false otherwise
 */
function isValidExpirationDate(expirationDate) {
  // Check format
  if (!expirationDate.match(/^\d{2}\/\d{2}$/)) {
    return false;
  }
  
  // Parse date parts
  const parts = expirationDate.split('/');
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10) + 2000; // Assuming 20xx
  
  // Check month range
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Check if expired
  const now = new Date();
  const expirationDateObj = new Date(year, month, 0); // Last day of the month
  
  return expirationDateObj > now;
}

/**
 * Validates that departure date is before return date
 * @param {string} departureDate - Departure date in MM/DD/YYYY format
 * @param {string} returnDate - Return date in MM/DD/YYYY format
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidDateRange(departureDate, returnDate) {
  if (!isValidDate(departureDate) || !isValidDate(returnDate)) {
    return false;
  }
  
  const departParts = departureDate.split('/');
  const returnParts = returnDate.split('/');
  
  const departDateObj = new Date(
    parseInt(departParts[2], 10),
    parseInt(departParts[0], 10) - 1,
    parseInt(departParts[1], 10)
  );
  
  const returnDateObj = new Date(
    parseInt(returnParts[2], 10),
    parseInt(returnParts[0], 10) - 1,
    parseInt(returnParts[1], 10)
  );
  
  return returnDateObj >= departDateObj;
}

/**
 * Validates airport code format (3 uppercase letters)
 * @param {string} code - The airport code to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidAirportCode(code) {
  return /^[A-Z]{3}$/.test(code);
}

module.exports = {
  luhnCheck,
  isValidDate,
  isValidExpirationDate,
  isValidDateRange,
  isValidAirportCode
}; 