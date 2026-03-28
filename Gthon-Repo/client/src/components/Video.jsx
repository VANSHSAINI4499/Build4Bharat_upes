import React from 'react';
import Subtitles from './Subtitles';

const Video = () => {
  const relatedVideos = [
    { title: 'React Hooks Explained', thumbnail: 'https://via.placeholder.com/150', duration: '12:34' },
    { title: 'Building with Vite + React', thumbnail: 'https://via.placeholder.com/150', duration: '9:45' },
    { title: 'Modular CSS Best Practices', thumbnail: 'https://via.placeholder.com/150', duration: '7:20' },
  ];

  return (
    <main id="main-content" style={styles.pageWrapper} aria-label="Video learning page">
      {/* Left side: Main video and content */}
      <section style={styles.contentWrapper} aria-label="Primary video content">
        <video style={styles.video} controls poster="https://via.placeholder.com/800x450">
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <h1 style={styles.title}>Mastering React: From Zero to Hero</h1>
        <p style={styles.description}>
          Dive into this comprehensive React tutorial and build scalable web apps with ease. Perfect for beginners and pros alike.
        </p>

        <button type="button" style={styles.buyButton}>Buy Now ₹499</button>

        <div style={styles.creatorBox}>
          <img src="https://via.placeholder.com/50" alt="Creator" style={styles.creatorImage} />
          <span style={styles.creatorName}>Created by Kunal DevWorks</span>
        </div>

        <div style={styles.ratingBox}>
          <span style={styles.stars}>⭐⭐⭐⭐☆</span>
          <span style={styles.reviewCount}>(124 reviews)</span>
        </div>

        <div style={styles.tags}>
          {['React', 'Frontend', 'JavaScript', 'Vite', 'Modular CSS'].map((tag) => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Related Videos</h2>
        <div style={styles.relatedContainer}>
          {relatedVideos.map((video, index) => (
            <article key={index} style={styles.relatedCard}>
              <img src={video.thumbnail} alt={video.title} style={styles.relatedThumbnail} />
              <div style={styles.relatedInfo}>
                <p style={styles.relatedTitle}>{video.title}</p>
                <span style={styles.relatedDuration}>{video.duration}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Right side: Subtitles */}
      <aside style={styles.subtitleWrapper} aria-label="Subtitles panel" className="skip-reading" data-no-read="true">
        <Subtitles />
      </aside>
    </main>
  );
};

// CSS-in-JS styles
const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  contentWrapper: {
    flex: 1,
    maxWidth: '70%',
    paddingRight: '20px',
  },
  video: {
    width: '100%',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  description: {
    fontSize: '1rem',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  buyButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '30px',
  },
  creatorBox: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  creatorImage: {
    borderRadius: '50%',
    marginRight: '10px',
  },
  creatorName: {
    fontWeight: 'bold',
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '10px',
  },
  stars: {
    fontSize: '1.2rem',
    color: '#f5c518',
  },
  reviewCount: {
    fontSize: '0.9rem',
    color: '#666',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '30px',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
  },
  relatedContainer: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  relatedCard: {
    width: '250px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  relatedThumbnail: {
    width: '100%',
    height: 'auto',
  },
  relatedInfo: {
    padding: '10px',
  },
  relatedTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  relatedDuration: {
    fontSize: '0.8rem',
    color: '#666',
  },
  subtitleWrapper: {
    width: '25%',
    position: 'sticky',
    top: '20px',
    alignSelf: 'flex-start',
  },
};

export default Video;