import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BD from './bd.json';
import bossImg from '../img/Boss.png';

// --- Стили (ОБНОВЛЕННЫЕ) ---

// 1. Обертка для идеального центрирования на весь экран
const centerWrapperStyle = {
  //width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center', // По горизонтали
  alignItems: 'center',     // По вертикали
  backgroundColor: '#000000', // Фон экрана (черный, как в теме)
  overflow: 'hidden',
  margin: '20px',
  padding: 0,
};

// 2. Стиль самой карточки (только оформление, БЕЗ position: absolute)
const mainWrapperStyle = {
  border: '2px solid #ffffff',
  backgroundColor: '#000000',
  borderRadius: '15px',
  overflow: 'hidden',
  padding: '20px',
  // УБРАНЫ: position, top, left, transform, margin (теперь управляется wrapper)
  
  // Адаптивность: максимум 700px, минимум 90% ширины (для телефонов)
  maxWidth: '700px',
  width: '90%', 
};

const styleText = {
  color: '#ffffff',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '600',
  fontSize: '20px',
  margin: '5px',
  textAlign: 'center',
};

const wordsStyle = {
  border: '2px solid #ffffff',
  backgroundColor: '#000000',
  color: '#ffffff',
  borderRadius: '7px',
  textAlign: 'center',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '600',
  fontSize: '20px',
  width: '30px',
  height: '30px',
  margin: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const wrapperStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  padding: '10px',
  justifyContent: 'center',
};

const buttonStyle = {
  ...wordsStyle,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: '0.5',
  cursor: 'not-allowed',
};

const gameOverButtonStyle = {
  ...buttonStyle,
  opacity: '0.3',
  cursor: 'not-allowed',
  filter: 'grayscale(1)',
};

const hintStyle = {
  ...styleText,
  fontSize: '16px',
  color: '#cccccc',
  marginBottom: '10px',
};

const energyTextStyle = {
  ...styleText,
  fontSize: '25px',
  color: '#cccccc',
  margin: 0,
  fontWeight: 'bold',
  marginLeft: '10px',
  marginRight: '10px',
};

const bossNameStyle = {
  color: '#ff4444',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '700',
  fontSize: '28px',
  textAlign: 'center',
  margin: '10px 0',
  textShadow: '2px 2px 4px rgba(255, 68, 68, 0.5)',
};

const bossImgStyle = {
  display: 'block',
  margin: '0 auto',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '3px solid #ff4444',
  boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)',
  transition: 'transform 0.3s ease, filter 0.3s ease',
};

const forwardButtonStyle = {
  fontFamily: "'Roboto Mono', monospace",
  border: '2px solid #ffffff',
  borderRadius: '10px',
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  display: 'block',
  margin: '15px auto',
  padding: '10px 40px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
};

const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

const bossData = BD.gallowGame.filter(item => item.id >= 31 && item.id <= 41);
const BOSS_WORDS_COUNT = bossData.length;
const MAX_MISTAKES = 10;
const DAMAGE_PER_WORD = 10;

const ToBoss = () => {
  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [bossEnergy, setBossEnergy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [gameStatus, setGameStatus] = useState('Энергия босса:');
  const [usedLetters, setUsedLetters] = useState(new Set());
  const [bossHit, setBossHit] = useState(false);
  const [bossRage, setBossRage] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords] = useState(new Set());

  const currentWord = useMemo(
    () => bossData[currentWordIndex]?.gallowWord || [],
    [currentWordIndex]
  );

  const currentHint = useMemo(
    () => bossData[currentWordIndex]?.hint || '',
    [currentWordIndex]
  );

  const [visible, setVisible] = useState(() => currentWord.map(() => false));

  useEffect(() => {
    setVisible(currentWord.map(() => false));
    setUsedLetters(new Set());
  }, [currentWordIndex, currentWord]);

  function removeRandomLevel() {
    const completedKeys = [];
    for (let i = 1; i <= 30; i++) {
      const key = `qWG-${i}`;
      if (localStorage.getItem(key) === 'true') {
        completedKeys.push(key);
      }
    }

    if (completedKeys.length > 0) {
      const randomKey = completedKeys[Math.floor(Math.random() * completedKeys.length)];
      localStorage.removeItem(randomKey);
      localStorage.setItem('deletedLevel', randomKey);
    }
  }

  useEffect(() => {
    if (visible.length === 0) return;
    const isWordDone = visible.every(v => v);
    if (!isWordDone) return;
    if (gameStatus.includes('Победа') || gameStatus.includes('Поражение')) return;

    const newBossEnergy = Math.max(bossEnergy - DAMAGE_PER_WORD, 0);
    setBossEnergy(newBossEnergy);

    const isLastWord = currentWordIndex >= BOSS_WORDS_COUNT - 1;

    if (isLastWord || newBossEnergy <= 0) {
      setGameStatus('Победа! Босс повержен!');
      localStorage.setItem('bossDefeated', 'true');
      setTimeout(() => navigate('/toGift'), 1500);
    } else {
      setGameStatus('Энергия босса:');
      setTimeout(() => setCurrentWordIndex(prev => prev + 1), 800);
    }
  }, [visible]);

  useEffect(() => {
    if (mistakes >= MAX_MISTAKES && !gameStatus.includes('Победа') && !gameStatus.includes('Поражение')) {
      setGameStatus('Поражение...');
      removeRandomLevel();
      setTimeout(() => navigate('/toErrorBoss'), 1500);
    }
  }, [mistakes, gameStatus, navigate]);

  useEffect(() => {
    if (bossHit) {
      const timer = setTimeout(() => setBossHit(false), 400);
      return () => clearTimeout(timer);
    }
  }, [bossHit]);

  useEffect(() => {
    if (bossRage) {
      const timer = setTimeout(() => setBossRage(false), 600);
      return () => clearTimeout(timer);
    }
  }, [bossRage]);

  function checkLetter(letter) {
    if (gameStatus.includes('Победа') || gameStatus.includes('Поражение') || usedLetters.has(letter)) return;
    setUsedLetters(prev => new Set(prev).add(letter));

    const foundIndices = currentWord
      .map((wordLetter, idx) => wordLetter === letter ? idx : -1)
      .filter(idx => idx !== -1);

    if (foundIndices.length > 0) {
      setVisible(prev =>
        prev.map((val, idx) => foundIndices.includes(idx) ? true : val)
      );
      setBossHit(true);
    } else {
      setMistakes(prev => prev + 1);
      setBossRage(true);
    }
  }

  const getBossEnergyClass = () => {
    if (bossEnergy > 50) return 'green';
    if (bossEnergy > 20) return 'yellow';
    return 'red';
  };

  const startFight = () => setShowIntro(false);
  const isGameOver = gameStatus.includes('Победа') || gameStatus.includes('Поражение');

  const bossCurrentStyle = {
    ...bossImgStyle,
    ...(bossHit ? { filter: 'brightness(2) sepia(1) saturate(5) hue-rotate(-10deg)' } : {}),
    ...(bossRage
      ? {
          transform: 'scale(1.6) translate(0, -10px)',
          filter: 'brightness(1.5) drop-shadow(0 0 20px #ff0000)',
          border: '3px solid #ff0000',
          boxShadow: '0 0 40px rgba(255, 0, 0, 0.8)',
        }
      : {}),
  };

  if (showIntro) {
    return (
      // ГЛАВНАЯ ОБЕРТКА ДЛЯ ЦЕНТРИРОВАНИЯ
      <div style={centerWrapperStyle}>
        <div style={mainWrapperStyle}>
          <h2 style={bossNameStyle}>⚠ БОСС ⚠</h2>
          <div className="TextOfPerson">
            <p style={styleText}>
              Все 30 уровней пройдены. Босс ждёт тебя.
              <br />
              Угадай все слова, чтобы его победить.
              <br />
              Осторожно: у тебя всего {MAX_MISTAKES} ошибок.
            </p>
          </div>
          <button style={forwardButtonStyle} onClick={startFight}>
            ВПЕРЕД
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <img
              className="zloysnow"
              style={bossImgStyle}
              alt="Boss"
              src={bossImg}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isReady) return null;

  return (
    // ГЛАВНАЯ ОБЕРТКА ДЛЯ ЦЕНТРИРОВАНИЯ
    <div style={centerWrapperStyle}>
      <div style={mainWrapperStyle}>
        <h2 style={bossNameStyle}>⚠ БОСС ⚠</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <img
            className={`zloysnow ${bossRage ? 'boss-rage' : ''}`}
            style={bossCurrentStyle}
            alt="Boss"
            src={bossImg}
          />
        </div>

        <div style={hintStyle}>Подсказка: {currentHint}</div>

        <div style={wrapperStyle}>
          {visible.map((isVisible, idx) => (
            <div key={idx} style={wordsStyle}>
              {isVisible ? currentWord[idx] : ''}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={energyTextStyle}>{gameStatus}</p>

          <div className="energy-container">
            <div
              className={`energy-bar ${getBossEnergyClass()} ${bossHit ? 'shake' : ''}`}
              style={{ width: `${bossEnergy}%` }}
            />
            <span className="energy-text">{bossEnergy}%</span>
          </div>
        </div>

        <div style={wrapperStyle}>
          {alphabet.map(letter => {
            const isUsed = usedLetters.has(letter);
            let style;
            if (isGameOver) {
              style = gameOverButtonStyle;
            } else if (isUsed) {
              style = disabledButtonStyle;
            } else {
              style = buttonStyle;
            }

            return (
              <button
                key={letter}
                style={style}
                onClick={() => checkLetter(letter)}
                disabled={isGameOver || isUsed}
                aria-label={`Буква ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ToBoss;
