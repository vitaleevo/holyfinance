/**
 * Formats a number as Angolan Kwanza (AOA).
 */
export function formatKwanza(amount: number, showSign: boolean = false, type?: 'income' | 'expense'): string {
    const formatted = new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        maximumFractionDigits: 0
    }).format(amount);

    if (showSign && type) {
        return `${type === 'expense' ? '- ' : '+ '}${formatted}`;
    }

    return formatted;
}

/**
 * Helper to mask values if privacy mode is on.
 */
export function maskValue(value: string, isPrivate: boolean): string {
    return isPrivate ? '••••••' : value;
}
