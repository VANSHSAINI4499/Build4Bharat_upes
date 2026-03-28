import React from 'react';
import {
  Hero,
  Navbar,
  Companies,
  Courses,
  Achievement,
  Categories,
  Feedback,
  CTA,
  Footer,
} from '../components';
import AccessibilityControls from './AccessibilityControls';

const New = () => {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <Navbar />
      <main id="main-content" aria-label="Main learning dashboard content">
        <Hero />
        <Companies />
        <Courses />
        <Achievement />
        <Categories />
        <Feedback />
        <CTA />
      </main>
      <Footer />
      <AccessibilityControls />
    </div>
  );
};

export default New;