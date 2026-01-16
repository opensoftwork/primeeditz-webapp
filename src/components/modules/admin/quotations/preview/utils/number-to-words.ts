/**
 * Number to Words Utility
 *
 * Converts numbers to Indian Rupee word format
 * Supports Lakh and Crore denominations
 */

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertToWords(n: number): string {
  if (n < 20) return ones[n];
  if (n < 100)
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  if (n < 1000)
    return (
      convertToWords(Math.floor(n / 100)) +
      " Hundred" +
      (n % 100 !== 0 ? " and " + convertToWords(n % 100) : "")
    );
  if (n < 100000)
    return (
      convertToWords(Math.floor(n / 1000)) +
      " Thousand" +
      (n % 1000 !== 0 ? " " + convertToWords(n % 1000) : "")
    );
  if (n < 10000000)
    return (
      convertToWords(Math.floor(n / 100000)) +
      " Lakh" +
      (n % 100000 !== 0 ? " " + convertToWords(n % 100000) : "")
    );
  return (
    convertToWords(Math.floor(n / 10000000)) +
    " Crore" +
    (n % 10000000 !== 0 ? " " + convertToWords(n % 10000000) : "")
  );
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const words = convertToWords(Math.floor(num));
  return words ? words.trim() : "";
}

export function amountInWords(amount: number): string {
  const words = numberToWords(amount);
  return words ? `${words} Rupees Only` : "Zero Rupees Only";
}
