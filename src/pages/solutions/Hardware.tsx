import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { Cpu, Wifi, Microchip, Layers, Settings, Activity, Cloud } from 'lucide-react';

export default function HardwareSolutions() {
  const offerings = [
    {
      title: "Embedded Systems",
      description: "Custom firmware and software development for microcontrollers and microprocessors, ensuring optimal performance and resource management.",
      icon: <Microchip className="w-6 h-6" />
    },
    {
      title: "IoT Architecture",
      description: "End-to-end Internet of Things solutions connecting edge devices to cloud platforms for real-time telemetry and control.",
      icon: <Wifi className="w-6 h-6" />
    },
    {
      title: "PCB Design & Prototyping",
      description: "Professional Printed Circuit Board design, layout, and rapid prototyping services for industrial and commercial applications.",
      icon: <Layers className="w-6 h-6" />
    },
    {
      title: "Industrial Automation",
      description: "Integration of PLCs, sensors, and actuators to automate manufacturing processes and improve operational efficiency.",
      icon: <Settings className="w-6 h-6" />
    },
    {
      title: "Sensor Networks",
      description: "Deployment of distributed sensor networks for environmental monitoring, asset tracking, and structural health analysis.",
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: "Hardware Integration",
      description: "Seamlessly bridging legacy industrial hardware with modern software dashboards and predictive maintenance systems.",
      icon: <Cpu className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-20 lg:py-32">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold mb-6 border border-emerald-500/30">
              <Cpu className="w-4 h-4" /> Solutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Hardware & IoT Engineering
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              We engineer intelligent physical systems. From custom PCB design to global IoT deployments, we bridge the gap between the physical and digital worlds.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-20 lg:py-32">
        <SectionHeader 
          title="Hardware Capabilities" 
          description="Sricore Solutions delivers robust, industrial-grade hardware and firmware designed for reliability in demanding environments."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                {offering.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{offering.title}</h3>
              <p className="text-slate-600 leading-relaxed">{offering.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="pb-20 lg:pb-32">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The IoT Ecosystem</h2>
            <p className="text-slate-600">Our comprehensive approach to connected devices ensures secure, low-latency communication from the edge to the cloud.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Edge */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                <Cpu className="w-8 h-8 text-slate-700" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">1. Edge Devices</h4>
              <p className="text-sm text-slate-600">Sensors, microcontrollers, and actuators collecting data and performing local processing.</p>
            </div>
            
            {/* Gateway */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                <Wifi className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">2. Connectivity</h4>
              <p className="text-sm text-slate-600">Secure transmission via MQTT, CoAP, LoRaWAN, BLE, or Cellular networks.</p>
            </div>
            
            {/* Cloud */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                <Cloud className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">3. Cloud & Dashboard</h4>
              <p className="text-sm text-slate-600">Data ingestion, analytics, visualization, and remote device management.</p>
            </div>
          </div>
        </div>
      </Container>

      <CTASection 
        title="Looking to develop a connected product?"
        description="Discuss your hardware specifications, connectivity requirements, and production goals with our engineers."
        primaryAction={{ label: "Request Hardware Consultation", href: "/enquiry" }}
      />
    </div>
  );
}
