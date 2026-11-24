import { z } from 'zod';
export const address = 'Lituania 30-B, Col. París Nueva Orleans, C.P. 45200, Guadalajara / Zapopan, Jalisco, México.';
export const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
export const whatsappUrl = `https://wa.me/523312976834?text=${encodeURIComponent('Hola, me gustaría solicitar información para agendar una cita en NAJANA STUDIO.')}`;
export const services = [
  { id: 'corte', name: 'Estilismo y Corte', description: 'Renueva tu imagen con cortes y estilizados que resaltan tu personalidad y se adaptan a tu estilo.', duration: '45–60 min' },
  { id: 'color', name: 'Colorimetría y Tratamientos Capilares', description: 'Dale nueva vida a tu cabello con opciones de color, técnicas de iluminación y tratamientos para su cuidado.', duration: '90–180 min' },
  { id: 'unas', name: 'Manicure y Pedicure', description: 'Cuida tus manos y pies con diseños de uñas, acabados elegantes y detalles que complementan tu estilo.', duration: '45–90 min' },
  { id: 'cejas', name: 'Diseño de Cejas y Pestañas', description: 'Realza tu mirada con servicios de diseño y cuidado de cejas y pestañas.', duration: '30–60 min' },
  { id: 'maquillaje', name: 'Maquillaje Social', description: 'Luce espectacular en tus eventos especiales con maquillaje adaptado a tu personalidad y ocasión.', duration: '60–90 min' },
] as const;
export function localToday(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function isValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && localToday(parsed) === date;
}
export function timeOptions(date: string) {
  const sunday = isValidDate(date) && new Date(`${date}T12:00:00`).getDay() === 0;
  return sunday ? ['08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'] : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
}
export function timeLabel(time: string) {
  const hour = Number(time.split(':')[0]);
  return `${hour % 12 || 12}:${time.split(':')[1] ?? '00'} ${hour >= 12 ? 'PM' : 'AM'}`;
}
export function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}
export const appointmentSchema = (today = localToday()) => z.object({
  name: z.string().trim().min(3, 'Escribe tu nombre completo (al menos 3 caracteres).').max(100, 'Usa un máximo de 100 caracteres.'),
  phone: z.string().trim().max(25, 'Revisa tu número de teléfono.').refine(value => {
    if (!/^[+\d\s()-]+$/.test(value)) return false;
    const digits = value.replace(/\D/g, '');
    return /^\d{10}$/.test(digits) || /^52\d{10}$/.test(digits) || /^521\d{10}$/.test(digits);
  }, 'Escribe un teléfono de 10 dígitos; puedes incluir +52.'),
  service: z.string().refine(value => services.some(service => service.id === value), 'Selecciona un servicio.'),
  date: z.string().refine(isValidDate, 'Selecciona una fecha válida.').refine(value => value >= today, 'Elige hoy o una fecha posterior.'),
  time: z.string().min(1, 'Selecciona un horario.'),
  notes: z.string().trim().max(1000, 'Usa un máximo de 1000 caracteres.'),
}).superRefine((value, context) => {
  if (!timeOptions(value.date).includes(value.time)) context.addIssue({ code: 'custom', path: ['time'], message: 'Elige un horario dentro de la atención del estudio; domingo de 8:30 AM a 3:00 PM.' });
});
export type Appointment = z.infer<ReturnType<typeof appointmentSchema>>;
export const emptyAppointment: Appointment = { name: '', phone: '', service: '', date: '', time: '', notes: '' };
