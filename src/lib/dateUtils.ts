/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para la zona horaria de Venezuela (America/Caracas, UTC-4)
 * Evita problemas de desfase de fecha al usar toISOString() que devuelve UTC
 */
export function getVenezuelaDate(date: Date = new Date()): string {
    // Convertir a zona horaria de Venezuela (America/Caracas, UTC-4)
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
