import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Database } from 'lucide-react';

export function SeedInternshipsButton() {
  const [seeding, setSeeding] = useState(false);

  const programs = [
    {
      title: "Full-Stack Web Development",
      description: "Build scalable web applications using React, Node.js, and Firebase.",
      durationMonths: 3,
      mode: "online",
      technologies: ["React", "Node.js", "Firebase", "Tailwind"],
      learningObjectives: ["Frontend UI development", "Backend API integration", "Database management"],
      fees: 5000,
      eligibility: "Basic knowledge of JavaScript",
      capacity: 10,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      status: "published",
      isOpen: true
    },
    {
      title: "AI & Machine Learning",
      description: "Develop predictive models and AI solutions for real-world problems.",
      durationMonths: 6,
      mode: "hybrid",
      technologies: ["Python", "TensorFlow", "Pandas", "Scikit-Learn"],
      learningObjectives: ["Data preprocessing", "Model training", "Model deployment"],
      fees: 8000,
      eligibility: "Python proficiency and basic Math",
      capacity: 5,
      startDate: serverTimestamp(),
      endDate: serverTimestamp(),
      status: "published",
      isOpen: true
    }
  ];

  const seedData = async () => {
    setSeeding(true);
    try {
      const colRef = collection(db, 'internship_programs');
      for (const program of programs) {
        await addDoc(colRef, program);
      }
      alert('Internship programs seeded successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Failed to seed data.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Button onClick={seedData} isLoading={seeding} className="flex items-center gap-2">
      <Database className="w-4 h-4" /> Seed Internship Programs
    </Button>
  );
}
