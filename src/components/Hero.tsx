import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Cpu, BrainCircuit, Microscope, ShieldCheck } from 'lucide-react';
import { Container } from './ui/Container';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

export function Hero() {
  const { settings } = useWebsiteSettings();
  const hero = settings?.hero;
  const primaryColor = settings?.theme?.primary || '#d97706';

  const badgeText = hero?.badge || 'Sricore Solutions · Engineering & Applied Research';
  const titleLead = hero?.title || 'Engineering Enterprise';
  const titleAccent = hero?.titleHighlight || 'Digital & Hardware Foundations';
  const missionStatement =
    hero?.description ||
    'Sricore Solutions bridges rigorous academic research and commercial engineering execution. Our mission is to design, validate, and deploy resilient enterprise software architectures, industrial IoT embedded hardware, and applied AI systems that solve complex real-world operational challenges.';

  const primaryCtaText = hero?.primaryCtaText || 'Schedule Discovery Call';
  const primaryCtaLink = hero?.primaryCtaLink || '/enquiry';
  const secondaryCtaText = hero?.secondaryCtaText || 'Explore Case Studies';
  const secondaryCtaLink = hero?.secondaryCtaLink || '/projects';

  const trustSignals =
    hero?.statsBadges && hero.statsBadges.length > 0
      ? hero.statsBadges
      : ['ISO-Aligned Engineering', 'Industrial IoT & Firmware', 'Applied AI & Research'];

  const coreDisciplines = [
    {
      index: '01',
      title: 'Enterprise Software Systems',
      detail: 'Distributed cloud-native platforms, RBAC portals, and high-throughput APIs.',
      metric: '99.95% SLA',
      icon: Code2,
      href: '/solutions/software',
    },
    {
      index: '02',
      title: 'Industrial IoT & Embedded Hardware',
      detail: 'Multi-layer PCB layout, STM32/ESP32 firmware, and Modbus/MQTT telemetry.',
      metric: '< 15ms Edge',
      icon: Cpu,
      href: '/solutions/hardware',
    },
    {
      index: '03',
      title: 'Applied AI & Computer Vision',
      detail: 'Custom defect inspection models, RAG pipelines, and quantized edge inference.',
      metric: '98.4% mAP',
      icon: BrainCircuit,
      href: '/solutions/ai-ml',
    },
    {
      index: '04',
      title: 'Scientific R&D & Prototyping',
      detail: 'Simulation validation, algorithm benchmarking, and IEEE/Scopus publication support.',
      metric: '100% Reproducible',
      icon: Microscope,
      href: '/services/research',
    },
  ];

  return (
    <section
      aria-label="Sricore Solutions Mission and Introduction"
      className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 md:py-16 lg:py-20"
    >
      {/* Subtle architectural grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_65%,transparent_100%)] opacity-45"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Brand Proposition, Mission Statement & Primary CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between pt-1">
            <div>
              {/* Clean typographic kicker — zero-pill discipline */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-4">
                <span style={{ color: primaryColor }}>{badgeText}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <span>Chennai, India</span>
              </div>

              {/* High-impact balanced display headline */}
              <h1
                className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-5"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                {titleLead}{' '}
                <span className="block mt-1" style={{ color: primaryColor }}>
                  {titleAccent}
                </span>
              </h1>

              {/* Concrete Mission Statement */}
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[62ch] mb-6">
                {missionStatement}
              </p>

              {/* Mission Pillar Callout */}
              <div className="border-l-2 pl-4 py-1 mb-8 border-slate-300 dark:border-slate-700" style={{ borderLeftColor: primaryColor }}>
                <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed max-w-[58ch]">
                  <strong className="font-bold text-slate-900 dark:text-white">Our Mission:</strong> Transform complex theoretical specifications into production-grade software, reliable industrial hardware, and verifiable research outcomes with full IP transparency.
                </p>
              </div>

              {/* Primary & Secondary Call-To-Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 mb-8">
                <Link
                  to={primaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white rounded-lg shadow-xs transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>

                {secondaryCtaLink.startsWith('http') ? (
                  <a
                    href={secondaryCtaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto"
                  >
                    {secondaryCtaText}
                  </a>
                ) : (
                  <Link
                    to={secondaryCtaLink}
                    className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto"
                  >
                    {secondaryCtaText}
                  </Link>
                )}
              </div>
            </div>

            {/* Trust Signals & Quantitative Proof Bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {trustSignals.map((signal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Engineering Architecture & Practice Matrix */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {hero?.monitorLabel || 'Core Engineering Divisions'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    Full-Stack & Hardware Execution Matrix
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-xs font-bold" style={{ color: primaryColor }}>
                    {hero?.uptime || '99.9%'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    System Reliability
                  </div>
                </div>
              </div>

              {/* Numbered Engineering Practice Tracks */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {coreDisciplines.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.index}
                      to={item.href}
                      className="group py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3.5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums pt-0.5">
                          {item.index}.
                        </span>
                        <div>
                          <div className="text-xs md:text-sm font-bold text-slate-900 dark:text-white group-hover:underline flex items-center gap-1.5">
                            <IconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                            <span>{item.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums shrink-0 pt-0.5">
                        {item.metric}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Telemetry & Delivery Benchmark Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-mono text-sm md:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    4 Domains
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                    R&D Coverage
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-mono text-sm md:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {hero?.cpuLoad || '100%'}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                    IP Handover
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <div
                    className="font-mono text-sm md:text-base font-extrabold tabular-nums"
                    style={{ color: primaryColor }}
                  >
                    24h SLA
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                    Tech Response
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
