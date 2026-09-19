import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img10 from '../img/Ten.png';

const ToErrorBoss = () => {
  const navigate = useNavigate();
  const [deletedLevel, setDeletedLevel] = useState(null);

  // Читаем, какой уровень был удалён
  useEffect(() => {
    const deleted = localStorage.getItem('deletedLevel');
    if (deleted) {
      setDeletedLevel(deleted);
      localStorage.removeItem('deletedLevel');
    }
  }, []);
  const containerStyle = {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: `url(${img10})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '24px',
    lineHeight: '1.4',
    maxWidth: '600px',
    padding: '20px',
  };

  const titleStyle = {
    fontSize: '48px',
    color: '#ff4444',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    fontWeight: 'bold',
  };

  const deletedLevelStyle = {
    marginTop: '15px',
    fontSize: '18px',
    color: '#ff8888',
  };

  const countdownStyle = {
    marginTop: '30px',
    fontSize: '18px',
    color: '#cccccc',
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />

      <div style={contentStyle}>
        <h1 style={titleStyle}>ПОРАЖЕНИЕ</h1>
        <p>
          Босс оказался сильнее. Ты допустил слишком много ошибок.
        </p>

        {/* Показываем, какой уровень был удалён */}
        {deletedLevel && (
          <p style={deletedLevelStyle}>
            Уровень {deletedLevel.slice(4)} удалён из твоего прогресса.
          </p>
        )}
      </div>
    </div>
  );
};

export default ToErrorBoss;
