import React from 'react';
import { Container } from './Container';

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="py-20 bg-slate-50 min-h-[60vh] flex items-center">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-lg text-slate-600">
            This page is currently under development as we finalize our digital infrastructure.
          </p>
        </div>
      </Container>
    </div>
  );
}
