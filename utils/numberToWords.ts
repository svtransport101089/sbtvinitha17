
export function numberToWords(num: number): string {
    if (num === 0) return 'Zero Rupees Only';
    if (isNaN(num)) return '';

    const belowTwenty = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWords = (n: number): string => {
        let word = '';
        if (n === 0) return '';
        if (n < 20) {
            word = belowTwenty[n];
        } else if (n < 100) {
            word = tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + belowTwenty[n % 10] : '');
        } else if (n < 1000) {
            word = belowTwenty[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numToWords(n % 100) : '');
        }
        return word;
    };

    let words = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remaining = Math.floor(num);

    if (crore > 0) words += numToWords(crore) + ' Crore ';
    if (lakh > 0) words += numToWords(lakh) + ' Lakh ';
    if (thousand > 0) words += numToWords(thousand) + ' Thousand ';
    if (remaining > 0) words += numToWords(remaining);

    return (words.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}
