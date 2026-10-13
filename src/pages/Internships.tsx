import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { AdSenseSlot } from '../components/ui/AdSenseSlot';
import { Briefcase, Code, Cpu, Brain, ArrowRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InternshipProgram } from '../types';

export default function Internships() {
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const q = query(
          collection(db, 'internship_programs'),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        const fetchedPrograms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InternshipProgram[];
        
        setPrograms(fetchedPrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const domains = [
    { title: "Software Development", icon: <Code className="w-6 h-6" />, color: "bg-blue-50 text-blue-600" },
    { title: "Hardware & IoT", icon: <Cpu className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600" },
    { title: "AI & Machine Learning", icon: <Brain className="w-6 h-6" />, color: "bg-purple-50 text-purple-600" },
    { title: "Research & Analysis", icon: <Briefcase className="w-6 h-6" />, color: "bg-orange-50 text-orange-600" }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 text-white py-5 md:py-6">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1.5">
              Internships & Training
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-3">
              Launch your technical career with Sricore Solutions. Gain hands-on experience working on real-world industry projects alongside experienced mentors and senior engineers.
            </p>
            <a 
              href="https://forms.gle/StQmejms3z9voMMU7" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Apply for Internship
            </a>
          </div>
        </Container>
      </div>

      <Container className="py-4 md:py-5">
        <SectionHeader 
          title="Training Domains" 
          description="We offer comprehensive technical training and project-based learning across multiple engineering disciplines."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 md:mt-4">
          {domains.map((domain, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2.5 ${domain.color}`}>
                {domain.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{domain.title}</h3>
            </div>
          ))}
        </div>
      </Container>

      <Container className="pb-5 md:pb-6">
        <SectionHeader 
          title="Available Programs" 
          description="Explore our currently open internship roles and apply to join our development teams."
        />
        
        <div className="mt-3 md:mt-4" id="available-programs">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48"></div>
              ))}
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map(program => (
                <div key={program.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{program.title}</h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {program.duration}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 flex-grow">{program.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {program.requirements?.slice(0, 3).map((req, i) => (
                      <span key={i} className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                        {req}
                      </span>
                    ))}
                  </div>

                  <a 
                    href="https://forms.gle/StQmejms3z9voMMU7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-auto"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Open Programs</h3>
              <p className="text-slate-500 mb-6">Check back later for new internship opportunities.</p>
              <a href="https://forms.gle/StQmejms3z9voMMU7" target="_blank" rel="noopener noreferrer">
                <button className="px-6 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
                  Submit General Application
                </button>
              </a>
            </div>
          )}
        </div>
      </Container>

      <CTASection 
        title="Ready to begin your journey?"
        description="Submit your application today. Our technical team will review your profile and reach out to you."
        primaryAction={{ label: "Apply Now", href: "https://forms.gle/StQmejms3z9voMMU7" }}
      />
    </div>
  );
}
