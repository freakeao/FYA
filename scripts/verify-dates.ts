import { getVenezuelaDate, getVenezuelaDayOfWeek } from "../src/lib/dateUtils";

console.log("=== VERIFICACIÓN DE FECHAS ===");
console.log("Fecha actual en Venezuela:", getVenezuelaDate());
console.log("Día de la semana:", getVenezuelaDayOfWeek());
console.log("\nComparación:");
console.log("UTC (incorrecto):", new Date().toISOString().split('T')[0]);
console.log("Venezuela (correcto):", getVenezuelaDate());
