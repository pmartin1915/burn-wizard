import React from 'react';
import InputForm from '@/components/InputForm';
import BodyMap from '@/components/BodyMap';

interface HomeProps {
  onNavigate: (route: 'home' | 'review' | 'settings') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InputForm onReviewClick={() => onNavigate('review')} />
      <BodyMap />
    </div>
  );
}