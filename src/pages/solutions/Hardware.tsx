import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { AdUnit } from '../../components/ui/AdUnit';
import { 
  Cpu, 
  Wifi, 
  Layers, 
  Settings, 
  Activity, 
  Cloud, 
  Radio, 
  CheckCircle2, 
  ShieldCheck, 
  Gauge, 
  Zap, 
  Terminal 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HardwareSolutions() {
  const offerings = [
    {
      title: "Embedded Firmware & RTOS Development",
      description: "Low-level firmware development in C/C++ and Rust for ARM Cortex-M (STM32, NXP), ESP32, and Nordic nRF series running FreeRTOS and Zephyr.",
      icon: <Cpu className="w-6 h-6" />,
      specs: ["Deterministic FreeRTOS & Zephyr", "DMA & Hardware Interrupt Drivers", "Ultra-Low Power Sleep Profiles", "Secure Boot & OTA Firmware Updates"]
    },
    {
      title: "Custom PCB Design & Rapid Prototyping",
      description: "Multi-layer PCB schematic design, high-speed trace routing, impedance matching, thermal dissipation modeling, and fabrication gerbers (Altium/KiCad).",
      icon: <Layers className="w-6 h-6" />,
      specs: ["4 to 8 Layer High-Density Interconnects", "Controlled Impedance Differential Pairs", "EMI / EMC Compliance Pre-Scans", "SMD Assembly & Stencil Verification"]
    },
    {
      title: "Industrial IoT & Telemetry Gateways",
      description: "Edge computing gateways translating industrial protocols (Modbus RTU/TCP, CAN bus, Profinet) into secure cloud telemetry via MQTT/TLS and HTTPS.",
      icon: <Wifi className="w-6 h-6" />,
      specs: ["RS-485 / Modbus Isolation", "CAN 2.0B / J1939 Telematics", "4G LTE-M / NB-IoT / LoRaWAN", "TLS 1.3 Hardware Cryptography"]
    },
    {
      title: "Sensor Network Engineering",
      description: "Design of distributed environmental and vibrational sensor nodes with sub-microamp sleep currents for condition-based machinery monitoring.",
      icon: <Activity className="w-6 h-6" />,
      specs: ["Tri-axial Accelerometer Sampling", "Precision ADC Calibration", "Energy Harvesting Circuits", "Long-Range Mesh Topologies"]
    },
    {
      title: "Industrial Automation & PLC Integration",
      description: "Commissioning programmable logic controllers, industrial relay racks, pneumatic diverters, and SCADA human-machine interfaces.",
      icon: <Settings className="w-6 h-6" />,
      specs: ["Siemens & Allen-Bradley Ladders", "Optocoupled 24V Industrial I/O", "Emergency Stop Safety Relays", "Factory Floor SCADA Dashboards"]
    },
    {
      title: "Edge AI Hardware Acceleration",
      description: "Integration of dedicated neural accelerator chips (NVIDIA Jetson, Coral Edge TPU, Hailo) for real-time edge computer vision and defect classification.",
      icon: <Gauge className="w-6 h-6" />,
      specs: ["TensorRT FP16 Acceleration", "Global Shutter Camera Interfaces", "Sub-15ms Inference Latencies", "Passive Heat Pipe Enclosures"]
    }
  ];

  const iotArchitecture = [
    {
      step: "01. Sensing & Actuation Layer",
      desc: "Microcontrollers (STM32/ESP32) reading analog/digital sensors via I2C, SPI, and UART with hardware interrupts and ADC oversampling."
    },
    {
      step: "02. Secure Edge Gateway Layer",
      desc: "Local data aggregation, JSON/Protobuf serialization, and edge filtering to suppress noise and conserve bandwidth."
    },
    {
      step: "03. Resilient Wireless Transport",
      desc: "Transmission across cellular 4G/NB-IoT, LoRaWAN, or WiFi with automatic offline queueing and exponential backoff retry logic."
    },
    {
      step: "04. Cloud Ingestion & Real-Time Telemetry",
      desc: "Broker ingestion via MQTT over TLS into TimescaleDB and real-time visualization on WebSocket telemetry dashboards."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 md:py-18">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3.5 border border-emerald-500/30">
              <Cpu className="w-3.5 h-3.5" /> Hardware Engineering Practice
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5">
              Hardware & IoT Engineering
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              We design, prototype, and manufacture reliable physical systems. From multi-layer PCB design and deterministic RTOS firmware to industrial IoT gateways and edge AI vision rigs, our engineers build durable hardware tailored for harsh environments.
            </p>
          </div>
        </Container>
      </div>

      {/* Capabilities Grid */}
      <Container className="py-12 md:py-16">
        <SectionHeader 
          title="Hardware & Embedded Systems Capabilities" 
          description="Sricore Solutions delivers complete end-to-end hardware solutions from initial breadboard feasibility to production PCB layouts and certified enclosures."
          badge="Engineering Services"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                {offering.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{offering.title}</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 flex-grow">{offering.description}</p>
              
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Technical Specifications:</span>
                <ul className="space-y-1">
                  {offering.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Policy-Compliant AdSense Slot */}
      <Container>
        <AdUnit className="my-6" />
      </Container>

      {/* IoT Ecosystem Architecture */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Industrial Architecture</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1 mb-3">
                End-to-End Edge-to-Cloud Telemetry Pipeline
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Designed to operate under industrial conditions with noise immunity, galvanic isolation, and fail-safe watchdog routines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {iotArchitecture.map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-emerald-600 block mb-1">STAGE 0{i + 1}</span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{item.step}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold mb-1">Want to review an actual industrial hardware deployment?</h4>
                <p className="text-xs text-slate-400">Explore our sub-millimeter edge vision inspection system and IoT telemetry dashboard case studies.</p>
              </div>
              <Link 
                to="/projects/quality-inspection" 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                View Case Study
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CTASection 
        title="Have a Hardware Concept to Prototype?"
        description="Connect with our hardware engineering team to evaluate schematics, firmware requirements, and manufacturing costs."
        primaryAction={{ label: "Inquire About Hardware Engineering", href: "/contact?service=hardware" }}
        secondaryAction={{ label: "Browse Production Case Studies", href: "/projects" }}
      />
    </div>
  );
}
