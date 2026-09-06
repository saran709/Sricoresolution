import React from 'react';
import { Container } from '../components/ui/Container';

export default function Privacy() {
  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <Container>
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-slate max-w-none">
            <p className="lead text-lg text-slate-700 mb-6">
              Sricore Solutions ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Sricore Solutions.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-700 mb-4">
              We collect information from you when you visit our website, register on our site, place an order, subscribe to our newsletter, respond to a survey, fill out a form, or use our services. The types of personal information collected may include:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-2">
              <li>Name and contact data (e.g., email address, phone number, physical address)</li>
              <li>Professional and employment-related information (e.g., for internship applications)</li>
              <li>Credentials and authentication information</li>
              <li>Project requirements and technical specifications</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-700 mb-4">
              We may use the information we collect from you in the following ways:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-2">
              <li>To personalize your experience and deliver the type of content and product offerings in which you are most interested.</li>
              <li>To improve our website in order to better serve you.</li>
              <li>To allow us to better service you in responding to your customer service requests.</li>
              <li>To administer a contest, promotion, survey, or other site feature.</li>
              <li>To quickly process your transactions and project milestones.</li>
              <li>To send periodic emails regarding your order or other products and services.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Security</h2>
            <p className="text-slate-700 mb-6">
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our databases.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Third-Party Disclosure</h2>
            <p className="text-slate-700 mb-6">
              We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Contacting Us</h2>
            <p className="text-slate-700 mb-6">
              If there are any questions regarding this privacy policy, you may contact us using the information provided on our Contact Us page.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
