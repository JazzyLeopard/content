import ContentPicker from '@/components/contentpicker';
import React from 'react';

export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
          <ContentPicker />
        </div>
      </main>
    );
  }
  