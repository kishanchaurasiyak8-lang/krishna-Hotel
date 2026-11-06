import { useState, type FormEvent } from 'react';
import { Loader2, Mail, Send, Clock } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Field from '@/components/ui/Field';
import { submitContactMessage } from '@/services/hotelService';
import { useToast } from '@/hooks/useToast';
import { isValidEmail } from '@/lib/validation';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const EMPTY_FORM: ContactForm = { name: '', email: '', message: '' };

export default function ContactSection() {
  const { showToast } = useToast();
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);

  const updateField = (key: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ContactErrors = {
      name: form.name.trim().length < 2 ? 'Enter your name.' : undefined,
      email: isValidEmail(form.email) ? undefined : 'Enter a valid email address.',
      message: form.message.trim().length < 5 ? 'Write a short message (at least 5 characters).' : undefined,
    };
    setErrors(nextErrors);
    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      showToast({ tone: 'error', title: 'Please complete the form', description: firstError });
      return;
    }

    setSending(true);
    try {
      await submitContactMessage(form);
      setForm(EMPTY_FORM);
      showToast({ tone: 'success', title: 'Message sent', description: 'Our team will get back to you soon.' });
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Message not sent',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const inputClass = (key: keyof ContactForm) => `input-base ${errors[key] ? 'input-invalid' : ''}`;

  return (
    <section id="contact" className="bg-navy-900 py-20 text-cream sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">Contact</p>
          <h2 className="mt-3 text-4xl text-cream sm:text-5xl">We would love to hear from you</h2>
          <p className="mt-5 leading-relaxed text-navy-200">
            Ask about rooms, dining or event planning. Our reception team is ready to help you plan the perfect stay.
          </p>
          <ul className="mt-10 space-y-5 text-sm text-navy-100">
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gold-300" aria-hidden="true" />
              Reception open around the clock
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gold-300" aria-hidden="true" />
              Send us a message and we will reply by email
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-3xl bg-cream p-6 text-navy-900 shadow-2xl sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="contact-name" error={errors.name}>
              <input
                id="contact-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className={inputClass('name')}
              />
            </Field>
            <Field label="Email" htmlFor="contact-email" error={errors.email}>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className={inputClass('email')}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Message" htmlFor="contact-message" error={errors.message}>
              <textarea
                id="contact-message"
                rows={5}
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                className={`${inputClass('message')} resize-none`}
              />
            </Field>
          </div>
          <button type="submit" disabled={sending} className="btn-primary mt-6 w-full">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
