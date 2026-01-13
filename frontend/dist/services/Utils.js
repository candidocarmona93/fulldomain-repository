export class Utils {
    /**
     * Formats a numeric value as a simple currency string.
     * Rounds the value to two decimal places and applies thousands and decimal separators.
     *
     * @param {number | null | undefined | string} value - The numeric value to format.
     * @param {string} [currencySymbol='MZN '] - The currency symbol to prepend (default is 'MZN ').
     * @param {string} [decimalSeparator='.'] - The character to use as the decimal separator (default is '.').
     * @param {string} [thousandsSeparator=','] - The character to use as the thousands separator (default is ',').
     * @returns {string} The formatted currency string (e.g., "MZN 1,234.56"). Returns "MZN 0.00" for null/undefined/empty input.
     */
    static simpleCurrencyFormat(value, currencySymbol = 'MZN ', decimalSeparator = '.', thousandsSeparator = ',') {
        // Handle null/undefined/empty input
        if (value === null || value === undefined || value === '') {
            return currencySymbol + '0' + decimalSeparator + '00';
        }

        // Round to two decimal places to handle floating point inaccuracies
        value = Math.round(value * 100) / 100;

        const parts = value.toString().split('.');
        let numeric = parts[0];
        let cents = parts.length > 1 ? parts[1] : '00';

        // Ensure cents always has two digits
        if (cents.length < 2) cents = cents.padEnd(2, '0');

        // Add thousands separators using regex
        numeric = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

        return currencySymbol + " " + numeric + decimalSeparator + cents;
    }
}