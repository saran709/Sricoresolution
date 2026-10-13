import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { APP_CONFIG } from '../config';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

import { z } from 'zod';

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validation
    const result = contactSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      to: APP_CONFIG.company.contact.email,
      subject: `New Contact Message from ${data.fullName}`,
      html: `<p>Name: ${data.fullName}</p>
             <p>Email: ${data.email}</p>
             <p>Message: ${data.message}</p>`
    };

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to send');
      
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { settings } = useWebsiteSettings();
  const contact = settings?.contact || APP_CONFIG.company.contact;
  const primaryColor = settings?.theme?.primary || '#2563eb';

  return (
    <div className="py-20 lg:py-32 bg-slate-50">
      <Container>
        <SectionHeader 
          title="Contact Us"
          description="We're here to help. Reach out to us for general inquiries, support, or partnership opportunities."
          badge="Get in Touch"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Details</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-slate-900">Email</h4>
                    <a href={`mailto:${contact.primaryEmail || APP_CONFIG.company.contact.email}`} className="text-slate-600 hover:underline transition-colors">
                      {contact.primaryEmail || APP_CONFIG.company.contact.email}
                    </a>
                    {contact.supportEmail && contact.supportEmail !== contact.primaryEmail && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Support: <a href={`mailto:${contact.supportEmail}`} className="hover:underline">{contact.supportEmail}</a>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-slate-900">Phone</h4>
                    <a href={`tel:${contact.primaryPhone || APP_CONFIG.company.contact.phone}`} className="text-slate-600 hover:underline transition-colors">
                      {contact.primaryPhone || APP_CONFIG.company.contact.phone}
                    </a>
                    {contact.altPhone && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Alt: <a href={`tel:${contact.altPhone}`} className="hover:underline">{contact.altPhone}</a>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-slate-900">Office Location</h4>
                    <p className="text-slate-600">
                      {contact.address || APP_CONFIG.company.contact.address}
                    </p>
                    {contact.workingHours && (
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Hours: {contact.workingHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="p-8 rounded-2xl shadow-sm text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <h3 className="text-xl font-bold mb-4">Looking for a quote?</h3>
              <p className="text-white/90 mb-6 text-sm leading-relaxed">
                If you have a specific project in mind, please use our detailed enquiry form so our engineering team can review your requirements prior to our discussion.
              </p>
              <a 
                href="/enquiry" 
                className="inline-block px-6 py-3 bg-white rounded-md font-semibold hover:bg-slate-50 transition-colors w-full text-center"
                style={{ color: primaryColor }}
              >
                Go to Project Enquiry
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Message Sent</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Thank you for contacting us. We have received your message and will get back to you shortly.
                </p>
                <Button onClick={() => setIsSuccess(false)}>Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Full Name" name="fullName" required placeholder="John Doe" />
                  <Input label="Email Address" name="email" type="email" required placeholder="john@example.com" />
                </div>
                <Input label="Subject" name="subject" required placeholder="How can we help?" />
                <Textarea 
                  label="Message" 
                  name="message"
                  required 
                  placeholder="Your message here..." 
                  className="min-h-[150px]"
                />
                <Button type="submit" isLoading={isSubmitting} className="py-3 px-8 mt-4">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
