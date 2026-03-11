/**
 * Obtiene el objeto Date ajustado a la zona horaria de Venezuela (UTC-4)
 */
export function getVenezuelaNow(): Date {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vzlaOffset = -4 * 60 * 60 * 1000;
    return new Date(utcTime + vzlaOffset);
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para Venezuela
 */
export function getVenezuelaDate(date?: Date): string {
    const vzlaDate = date ? (() => {
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        const vzlaOffset = -4 * 60 * 60 * 1000;
        return new Date(utcTime + vzlaOffset);
    })() : getVenezuelaNow();

    const year = vzlaDate.getFullYear();
    const month = String(vzlaDate.getMonth() + 1).padStart(2, '0');
    const day = String(vzlaDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtiene el día de la semana actual en español para Venezuela
 */
export function getVenezuelaDayOfWeek(date?: Date): string {
    const vzlaDate = date ? (() => {
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        const vzlaOffset = -4 * 60 * 60 * 1000;
        return new Date(utcTime + vzlaOffset);
    })() : getVenezuelaNow();

    const days = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    return days[vzlaDate.getDay()];
}

/**
 * Formatea una fecha YYYY-MM-DD string a algo legible en Venezuela
 */
export function formatToVenezuelaDate(dateStr: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }): string {
    if (!dateStr) return "";
    const date = new Date(dateStr + 'T12:00:00');
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
