import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, LoaderCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { appointmentSchema, dateLabel, emptyAppointment, localToday, services, timeLabel, timeOptions, whatsappUrl, type Appointment } from '@/lib/studio';

export function AppointmentForm({ selectedService }: { selectedService: { id: string; version: number } }) {
  const [form, setForm] = useState<Appointment>({ ...emptyAppointment });
  const [errors, setErrors] = useState<Partial<Record<keyof Appointment, string>>>({});
  const [summary, setSummary] = useState<Appointment | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [today, setToday] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { setToday(localToday()); }, []);
  useEffect(() => {
    if (selectedService.id) setForm(previous => ({ ...previous, service: selectedService.id }));
  }, [selectedService]);
  function update(key: keyof Appointment, value: string) {
    setForm(previous => ({ ...previous, [key]: value, ...(key === 'date' && !timeOptions(value).includes(previous.time) ? { time: '' } : {}) }));
    setErrors(previous => ({ ...previous, [key]: '' }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = appointmentSchema().safeParse(form);
    if (!result.success) {
      const next: Partial<Record<keyof Appointment, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Appointment;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    await new Promise(resolve => setTimeout(resolve, 350));
    setSummary(result.data);
    setForm({ ...emptyAppointment });
    setErrors({});
    setBusy(false);
    setOpen(true);
  }
  const fieldClass = 'w-full min-w-0 rounded-sm border border-input bg-card px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring';
  const error = (key: keyof Appointment) => errors[key] ? <p id={`${key}-error`} className="mt-1.5 text-xs text-destructive" role="alert">{errors[key]}</p> : null;
  const accessibility = (key: keyof Appointment) => ({ 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${key}-error` : undefined });
  return <>
    <form ref={formRef} onSubmit={submit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div><label htmlFor="name" className="mb-2 block text-sm">Nombre completo <span className="text-muted-foreground">*</span></label><input id="name" autoComplete="name" required maxLength={100} placeholder="Tu nombre completo" className={fieldClass} value={form.name} onChange={e => update('name', e.target.value)} {...accessibility('name')} />{error('name')}</div>
      <div><label htmlFor="phone" className="mb-2 block text-sm">Teléfono o WhatsApp <span className="text-muted-foreground">*</span></label><input id="phone" type="tel" autoComplete="tel" required maxLength={25} placeholder="33 1234 5678" className={fieldClass} value={form.phone} onChange={e => update('phone', e.target.value)} {...accessibility('phone')} />{error('phone')}</div>
      <div className="sm:col-span-2"><label htmlFor="service" className="mb-2 block text-sm">Servicio deseado <span className="text-muted-foreground">*</span></label><select id="service" required className={fieldClass} value={form.service} onChange={e => update('service', e.target.value)} {...accessibility('service')}><option value="">Selecciona un servicio</option>{services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select>{error('service')}</div>
      <div><label htmlFor="date" className="mb-2 block text-sm">Fecha preferida <span className="text-muted-foreground">*</span></label><input id="date" type="date" required min={today} className={fieldClass} value={form.date} onChange={e => update('date', e.target.value)} {...accessibility('date')} />{error('date')}</div>
      <div><label htmlFor="time" className="mb-2 block text-sm">Horario preferido <span className="text-muted-foreground">*</span></label><select id="time" required className={fieldClass} value={form.time} onChange={e => update('time', e.target.value)} {...accessibility('time')}><option value="">Selecciona un horario</option>{timeOptions(form.date).map(time => <option key={time} value={time}>{timeLabel(time)}</option>)}</select>{error('time')}</div>
      <div className="sm:col-span-2"><label htmlFor="notes" className="mb-2 block text-sm">Notas adicionales <span className="text-muted-foreground">(opcional)</span></label><textarea id="notes" maxLength={1000} rows={3} placeholder="Cuéntanos si tienes alguna preferencia o detalle que debamos conocer..." className={`${fieldClass} resize-y`} value={form.notes} onChange={e => update('notes', e.target.value)} {...accessibility('notes')} />{error('notes')}</div>
      <div className="sm:col-span-2"><Button variant="studio" size="studio" className="w-full" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="animate-spin" /> Preparando solicitud...</> : <>Solicitar cita <ArrowUpRight /></>}</Button><p className="mt-4 flex items-start justify-center gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Tu solicitud se muestra solo en esta página. Contacta al estudio para confirmar disponibilidad.</p></div>
    </form>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto p-7 sm:p-9"><div className="flex size-12 items-center justify-center rounded-full bg-secondary"><Check /></div><DialogTitle className="font-display text-3xl font-medium">Un momento para ti</DialogTitle><DialogDescription className="leading-relaxed">¡Gracias por elegir NAJANA STUDIO! Tu solicitud de cita ha sido registrada en esta página. Recuerda que tu horario está sujeto a confirmación por parte del estudio.</DialogDescription>{summary && <dl className="space-y-3 border-y border-border py-5 text-sm"><div><dt className="text-muted-foreground">Nombre</dt><dd>{summary.name}</dd></div><div><dt className="text-muted-foreground">Teléfono</dt><dd>{summary.phone}</dd></div><div><dt className="text-muted-foreground">Servicio</dt><dd>{services.find(service => service.id === summary.service)?.name}</dd></div><div><dt className="text-muted-foreground">Fecha y horario preferidos</dt><dd>{dateLabel(summary.date)} · {timeLabel(summary.time)}</dd></div>{summary.notes && <div><dt className="text-muted-foreground">Notas adicionales</dt><dd className="break-words">{summary.notes}</dd></div>}</dl>}<p className="text-xs text-muted-foreground">No se ha enviado al estudio ni guardado fuera de esta página.</p><Button variant="studio" size="studio" asChild><a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle /> Contactar por WhatsApp</a></Button><Button variant="editorial" size="studio" onClick={() => setOpen(false)}>Cerrar y volver al formulario</Button></DialogContent></Dialog>
  </>;
}
