import { firebaseService } from '../lib/firebaseService';
import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';


import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function IdeaLab() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    idea: '',
    problem: '',
    desiredOutcome: '',
    industry: '',
    technologyPreference: '',
    budget: '',
    timeline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
      const requestId = `SRC-IDEA-${year}-${randomStr}`;

      await firebaseService.create('ideaLab', {

        requestId,
        userId: currentUser?.uid || null,
        ...formData,
        status: 'NEW',
        
        
      
});

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting idea:", error);
      alert("Failed to submit idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <Container>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Your idea has been received.</h1>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for sharing your idea. Our team explores all submissions, and if we see a technical match, we'll reach out to discuss the possibilities.
            </p>
            <Button onClick={() => window.location.href = '/'}>Return Home</Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Have an idea? Let's explore it.</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Welcome to the Sricore Client Idea Lab. If you have an innovative concept or a hypothesis you want to test, share it with us.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Your Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="Email Address *" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Organization (Optional)" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
              <Input label="Industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
            </div>

            <Textarea 
              label="What is your idea? *" 
              required 
              rows={4}
              placeholder="Describe your concept in a few sentences..."
              value={formData.idea} 
              onChange={e => setFormData({...formData, idea: e.target.value})} 
            />

            <Textarea 
              label="What problem does this idea solve? *" 
              required 
              rows={3}
              value={formData.problem} 
              onChange={e => setFormData({...formData, problem: e.target.value})} 
            />

            <Textarea 
              label="What is the desired outcome?" 
              rows={3}
              value={formData.desiredOutcome} 
              onChange={e => setFormData({...formData, desiredOutcome: e.target.value})} 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Technology Preference" placeholder="e.g. AI, Mobile App" value={formData.technologyPreference} onChange={e => setFormData({...formData, technologyPreference: e.target.value})} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Timeline</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-white"
                  value={formData.timeline}
                  onChange={e => setFormData({...formData, timeline: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Within 3 months">Within 3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="1+ Year">1+ Year</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Budget Range</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-white"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="To be determined">To be determined</option>
                  <option value="< $10k">&lt; $10k</option>
                  <option value="$10k - $50k">$10k - $50k</option>
                  <option value="$50k+">$50k+</option>
                </select>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg h-14" isLoading={loading}>
              Submit to Idea Lab
            </Button>

          </form>
        </div>
      </Container>
    </div>
  );
}
