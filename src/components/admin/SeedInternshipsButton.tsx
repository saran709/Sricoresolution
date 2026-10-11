import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { seedAdminDashboardData } from '../../lib/dataSeeder';
import { useAuth } from '../../contexts/AuthContext';

export function SeedInternshipsButton() {
  const { currentUser } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const programs = [
    {
      title: "Full-Stack Web Development & Cloud Systems",
      description: "Build scalable web applications using React, Node.js, Express, and Firebase Cloud Firestore.",
      durationMonths: 3,
      mode: "online",
      technologies: ["React", "TypeScript", "Node.js", "Firebase", "Tailwind CSS"],
      learningObjectives: ["Modern SPA frontend UI development", "RESTful API engineering", "Database security & rules"],
      fees: 5000,
      eligibility: "Basic knowledge of programming & JavaScript",
      capacity: 15,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      status: "published",
      isOpen: true
    },
    {
      title: "AI, Deep Learning & Computer Vision",
      description: "Develop predictive machine learning models, edge computer vision pipelines, and PyTorch models.",
      durationMonths: 6,
      mode: "hybrid",
      technologies: ["Python", "PyTorch", "TensorFlow", "OpenCV", "FastAPI"],
      learningObjectives: ["Dataset preprocessing & augmentation", "CNN & YOLO model fine-tuning", "Edge deployment"],
      fees: 8000,
      eligibility: "Python proficiency and basic linear algebra",
      capacity: 10,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      status: "published",
      isOpen: true
    },
    {
      title: "Embedded Systems, Robotics & IoT Telemetry",
      description: "Hands-on hardware prototyping with ARM Cortex, ESP32, LoRaWAN wireless sensors, and PCB design.",
      durationMonths: 4,
      mode: "offline",
      technologies: ["Embedded C/C++", "ESP32", "FreeRTOS", "MQTT", "KiCad PCB"],
      learningObjectives: ["Microcontroller peripheral interfacing", "Wireless sensor network protocols", "Firmware debugging"],
      fees: 7500,
      eligibility: "Basic electronics and C programming",
      capacity: 12,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      status: "published",
      isOpen: true
    }
  ];

  const seedData = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      // 1. Seed internship programs if missing
      const existingPrograms = await getDocs(collection(db, 'internship_programs'));
      for (const program of programs) {
        const found = existingPrograms.docs.some(d => d.data().title === program.title);
        if (!found) {
          await addDoc(collection(db, 'internship_programs'), program);
        }
      }

      // 2. Also populate other operational dashboard sample records
      await seedAdminDashboardData(currentUser?.uid);

      setFeedback('Internship programs & operational dashboard sample data successfully populated!');
      setTimeout(() => setFeedback(null), 5000);
    } catch (error: any) {
      console.error('Error seeding data:', error);
      setFeedback('Failed to seed data: ' + (error?.message || 'Check Firestore permissions'));
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {feedback && (
        <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {feedback}
        </span>
      )}
      <Button onClick={seedData} isLoading={seeding} variant="outline" className="flex items-center gap-2 border-slate-300 shadow-sm text-xs font-semibold">
        <Database className="w-3.5 h-3.5 text-blue-600" /> Seed Sample Programs & Data
      </Button>
    </div>
  );
}
