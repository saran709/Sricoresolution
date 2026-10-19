import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CTASection } from '../../components/ui/CTASection';
import { AdUnit } from '../../components/ui/AdUnit';
import { 
  Brain, 
  Sparkles, 
  Database, 
  Network, 
  Eye, 
  LineChart, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Binary, 
  CheckCircle2, 
  Terminal 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AISolutions() {
  const offerings = [
    {
      title: "Edge Computer Vision & Defect Classification",
      description: "Sub-millimeter automated optical inspection (AOI) utilizing custom-trained YOLOv8 and TensorRT-quantized CNN models executing under 14ms on NVIDIA Jetson edge silicon.",
      icon: <Eye className="w-6 h-6" />,
      capabilities: ["Surface Defect Segmentation", "Thermal Anomaly Mapping", "Facial Biometrics & Liveness", "High-Speed Strobe Synchronization"]
    },
    {
      title: "Generative AI & Enterprise RAG Pipelines",
      description: "Retrieval-Augmented Generation (RAG) architectures with hybrid dense/sparse vector search (Pinecone, ChromaDB, pgvector) and local/cloud LLMs with verifiable grounding.",
      icon: <Sparkles className="w-6 h-6" />,
      capabilities: ["Vector Embeddings & Semantic Search", "Deterministic Guardrails & Citations", "Multi-Agent Workflow Orchestration", "On-Premises LLM Fine-Tuning"]
    },
    {
      title: "Predictive Analytics & Industrial Telemetry",
      description: "Time-series forecasting models (LSTM, Prophet, XGBoost) trained on vibrational, thermal, and electrical telemetry to predict equipment failure prior to breakdown.",
      icon: <LineChart className="w-6 h-6" />,
      capabilities: ["Remaining Useful Life (RUL) Estimation", "Anomaly Detection in High-Hz Data", "Demand & Inventory Forecasting", "Automated Root-Cause Diagnosis"]
    },
    {
      title: "Natural Language Processing & Speech",
      description: "Custom NLP pipelines for multi-lingual sentiment analysis, entity extraction, automated contract parsing, and domain-specialized technical chatbot agents.",
      icon: <Brain className="w-6 h-6" />,
      capabilities: ["Named Entity Recognition (NER)", "Document Parsing & Classification", "Audio Transcription & Diarization", "Zero-Shot Text Summarization"]
    },
    {
      title: "Data Engineering & Feature Stores",
      description: "Building production-grade ETL/ELT data pipelines with automated schema validation, drift detection, and reproducible dataset versioning (DVC).",
      icon: <Database className="w-6 h-6" />,
      capabilities: ["Distributed Ingestion Pipelines", "Data Drift & Concept Drift Tracking", "Automated Data Annotation Workflows", "Parquet / Delta Lake Storage"]
    },
    {
      title: "Model Governance, MLOps & Quantization",
      description: "End-to-end model deployment lifecycles using MLflow, Docker, ONNX runtime, and INT8/FP16 post-training quantization for low-power edge deployment.",
      icon: <Cpu className="w-6 h-6" />,
      capabilities: ["INT8 / FP16 Model Quantization", "Prometheus Inference Latency Metrics", "A/B Testing & Shadow Deployments", "Regulatory Model Explainability"]
    }
  ];

  const aiLifecycle = [
    {
      stage: "01. Data Ingestion & Sanitization",
      desc: "Collecting empirical telemetry or image samples, stripping noise, balancing class representations, and validating ground-truth annotations."
    },
    {
      stage: "02. Architecture Selection & Training",
      desc: "Transfer learning on state-of-the-art backbones, tuning hyper-parameters via Bayesian optimization, and tracking loss convergence."
    },
    {
      stage: "03. Optimization & Quantization",
      desc: "Pruning redundant weights, compiling models with NVIDIA TensorRT or OpenVINO, reducing memory footprints by up to 70% without precision loss."
    },
    {
      stage: "04. Real-Time Inference & Monitoring",
      desc: "Deploying containerized micro-services with sub-20ms SLAs, continuous logging of confidence scores, and automated alerting on dataset drift."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 md:py-18">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3.5 border border-purple-500/30">
              <Brain className="w-3.5 h-3.5" /> Artificial Intelligence Practice
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5">
              Artificial Intelligence & Machine Learning
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              We engineer intelligent systems grounded in empirical data. From sub-millimeter industrial vision models deployed on edge silicon to enterprise Generative AI workflows with verifiable citations, we build AI solutions that deliver measurable ROI.
            </p>
          </div>
        </Container>
      </div>

      {/* Capabilities Grid */}
      <Container className="py-12 md:py-16">
        <SectionHeader 
          title="Artificial Intelligence & Data Capabilities" 
          description="Sricore Solutions designs, optimizes, and deploys high-throughput machine learning models engineered for real-world enterprise constraints."
          badge="Specialized Practice"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
          {offerings.map((offering, index) => (
            <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
                {offering.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{offering.title}</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 flex-grow">{offering.description}</p>
              
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Technical Capabilities:</span>
                <ul className="space-y-1">
                  {offering.capabilities.map((cap, cIdx) => (
                    <li key={cIdx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      {cap}
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

      {/* MLOps Lifecycle */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Methodology</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1 mb-3">
                Production MLOps & Model Deployment Lifecycle
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Machine learning in production requires reproducibility, continuous validation, and low latency. Here is how our AI models progress from research to production.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiLifecycle.map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-purple-600 block mb-1">PHASE 0{i + 1}</span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{item.stage}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Verification & Benchmarking Link */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold mb-1">Live Computer Vision Case Study</h4>
                <p className="text-xs text-slate-400">Review our Automated Quality Inspection System with interactive simulation and benchmark latency metrics.</p>
              </div>
              <Link 
                to="/projects/quality-inspection" 
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                Inspect Live Case Study
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CTASection 
        title="Explore AI Feasibility for Your Organization"
        description="Our machine learning engineers can assess your existing datasets, inference constraints, and deliver a clear technical feasibility report."
        primaryAction={{ label: "Inquire About AI Solutions", href: "/contact?service=ai" }}
        secondaryAction={{ label: "Browse Technical Case Studies", href: "/projects" }}
      />
    </div>
  );
}
