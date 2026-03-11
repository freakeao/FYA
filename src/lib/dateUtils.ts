/**
 * Obtiene el objeto Date ajustado a la zona horaria de Venezuela (UTC-4)
 */
export function getVenezuelaNow(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' }));
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para Venezuela
 */
export function getVenezuelaDate(date: Date = new Date()): string {
    const venezuelaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
    const year = venezuelaDate.getFullYear();
    const month = String(venezuelaDate.getMonth() + 1).padStart(2, '0');
    const day = String(venezuelaDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtiene el día de la semana actual en español para Venezuela
 */
export function getVenezuelaDayOfWeek(date: Date = new Date()): string {
    const venezuelaDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
    const days = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    return days[venezuelaDate.getDay()];
}

/**
 * Formatea una fecha YYYY-MM-DD string a algo legible en Venezuela
 */
export function formatToVenezuelaDate(dateStr: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }): string {
    const date = new Date(dateStr + 'T12:00:00'); // T12 para evitar problemas de zona horaria al parsear
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Convierte un objeto Date a string YYYY-MM-DD sin desvíos de zona horaria
 */
export function dateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

