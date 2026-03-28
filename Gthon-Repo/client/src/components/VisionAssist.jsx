import React from 'react';
import { useNavigate } from 'react-router-dom';

const VisionAssist = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <p style={styles.badge}>Vision Assist</p>
                <h1 style={styles.title}>Accessibility Vision Mode</h1>
                <p style={styles.subtitle}>
                    You reached this screen using voice navigation. Plug in your camera and gesture system here
                    to control the learning platform hands-free.
                </p>

                <div style={styles.features}>
                    <span style={styles.feature}>Live hand gesture mouse</span>
                    <span style={styles.feature}>High contrast friendly UI</span>
                    <span style={styles.feature}>Voice + tactile workflow</span>
                </div>

                <button style={styles.button} onClick={() => navigate('/new')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(120deg, #edf7ff 0%, #e8fff5 100%)',
        padding: '24px',
    },
    card: {
        width: 'min(680px, 100%)',
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
        border: '1px solid #e9eef5',
        padding: '32px',
    },
    badge: {
        display: 'inline-block',
        background: '#20B486',
        color: '#fff',
        borderRadius: '999px',
        padding: '6px 12px',
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '10px',
    },
    title: {
        margin: '0 0 12px 0',
        color: '#0e2433',
        fontSize: '2rem',
    },
    subtitle: {
        margin: '0 0 24px 0',
        color: '#496273',
        lineHeight: 1.7,
    },
    features: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '24px',
    },
    feature: {
        background: '#f4f8fb',
        border: '1px solid #dce7ef',
        borderRadius: '999px',
        padding: '8px 14px',
        fontSize: '0.86rem',
        color: '#1b3d52',
    },
    button: {
        border: 'none',
        borderRadius: '10px',
        background: '#0b6cff',
        color: '#fff',
        padding: '12px 18px',
        fontWeight: 700,
        cursor: 'pointer',
    },
};

export default VisionAssist;
