// components/ModelLoader.jsx
import { Html } from '@react-three/drei';
import { useState, useEffect } from 'react';

export default function ModelLoader({ message = "Loading model..." }) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Html center>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontFamily: 'monospace',
        border: '2px solid #ff00ff',
        minWidth: '200px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🕺</div>
        <div style={{ fontSize: '16px' }}>{message}{dots}</div>
        <div style={{ 
          fontSize: '12px', 
          marginTop: '10px', 
          opacity: 0.7,
          color: '#ff00ff'
        }}>
          Loading Male Dance Pose.fbx
        </div>
      </div>
    </Html>
  );
}