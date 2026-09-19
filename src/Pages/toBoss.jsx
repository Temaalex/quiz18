import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BD from './bd.json';
import bossImg from '../img/Boss.png';
import RealisticBrokenGlass from './test';
import kick from '../sound/glass_crash.mp3'
import useSound from 'use-sound';
// --- Обёртка для центрирования ---
const centerWrapperStyle = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#000000',
  overflow: 'hidden',
  margin: '20px',
  padding: 0,
};

// --- Стили карточки ---
const mainWrapperStyle = {
  border: '2px solid #ffffff',
  backgroundColor: '#000000',
  borderRadius: '15px',
  overflow: 'hidden',
  padding: '20px',
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

// Данные босса (id 31–41)
const bossData = BD.gallowGame.filter(item => item.id >= 31 && item.id <= 41);
const BOSS_WORDS_COUNT = bossData.length; // 11
const MAX_MISTAKES = 10;
const DAMAGE_PER_WORD = 10;
const GLASS_DURATION = 1500; // ← Длительность стекла (в мс)

const ToBoss = () => {
  const navigate = useNavigate();

  const [playSoundhit] = useSound(kick);
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [bossEnergy, setBossEnergy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [gameStatus, setGameStatus] = useState('Энергия босса:');
  const [usedLetters, setUsedLetters] = useState(new Set());
  const [bossHit, setBossHit] = useState(false);
  const [bossRage, setBossRage] = useState(false);
  const [glassShatter, setGlassShatter] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const currentWord = useMemo(
    () => bossData[currentWordIndex]?.gallowWord || [],
    [currentWordIndex]
  );

  const currentHint = useMemo(
    () => bossData[currentWordIndex]?.hint || '',
    [currentWordIndex]
  );

  const [visible, setVisible] = useState(() => currentWord.map(() => false));

  // Сброс при смене слова
  useEffect(() => {
    setVisible(currentWord.map(() => false));
    setUsedLetters(new Set());
  }, [currentWordIndex, currentWord]);

  // === ПРОВЕРКА localStorage: все ли 30 уровней пройдены ===
  // Проверяет ключи qWG-1 ... qWG-30 в localStorage.
  // Если хотя бы один не равен 'true' — редирект на /toError.
  // Если все пройдены — компонент готов к работе.
  useEffect(() => {
    let allCompleted = true;
    for (let i = 1; i <= 30; i++) {
      const levelKey = `qWG-${i}`;
      if (localStorage.getItem(levelKey) !== 'true') {
        allCompleted = false;
        break;
      }
    }

    if (!allCompleted) {
      navigate('/toErrorBoss');
      return;
    }

    setIsReady(true);
  }, [navigate]);

  // Удаление случайного уровня при поражении
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

  // Проверка: слово полностью угадано → 10% урона
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

      setTimeout(() => {
        navigate('/toGift');
      }, 1500);
    } else {
      setGameStatus('Энергия босса:');
      setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 800);
    }
  }, [visible]);

  // Поражение: 10 ошибок
  useEffect(() => {
    if (mistakes >= MAX_MISTAKES && !gameStatus.includes('Победа') && !gameStatus.includes('Поражение')) {
      setGameStatus('Поражение...');
      removeRandomLevel();

      setTimeout(() => {
        navigate('/toErrorBoss');
      }, 1500);
    }
  }, [mistakes, gameStatus, navigate]);

  // Анимация попадания по боссу (при правильной букве)
  useEffect(() => {
    if (bossHit) {
      const timer = setTimeout(() => setBossHit(false), 400);
      return () => clearTimeout(timer);
    }
  }, [bossHit]);

  // === ФАЗА 1: Ярость босса (400 мс) → переход к стеклу ===
  // Босс увеличивается, краснеет, потом "бьёт" → запускается стекло
  useEffect(() => {
    if (bossRage) {
      const timer = setTimeout(() => {
        
        setBossRage(false);
        setGlassShatter(true);
        
      }, 400);
      
      return () => clearTimeout(timer);
      
    }
    playSoundhit()
  }, [bossRage]);

  // === ФАЗА 2: Стекло (1500 мс) → очистка ===
  // Стекло висит GLASS_DURATION мс, потом убирается из DOM.
  // ВАЖНО: это число должно совпадать с duration в RealisticBrokenGlass.
  useEffect(() => {
    if (glassShatter) {
      const timer = setTimeout(() => setGlassShatter(false), GLASS_DURATION);
      return () => clearTimeout(timer);
    }
  }, [glassShatter]);

  // Проверка буквы
  function checkLetter(letter) {
    if (gameStatus.includes('Победа') || gameStatus.includes('Поражение') || usedLetters.has(letter)) return;

    setUsedLetters(prev => new Set(prev).add(letter));

    const foundIndices = currentWord
      .map((wordLetter, idx) => wordLetter === letter ? idx : -1)
      .filter(idx => idx !== -1);

    if (foundIndices.length > 0) {
      // Правильная буква → босс получает урон
      setVisible(prev =>
        prev.map((val, idx) => foundIndices.includes(idx) ? true : val)
      );
      setBossHit(true);
    } else {
      // Неправильная буква → босс злится → стекло
      setMistakes(prev => prev + 1);
      setBossRage(true); // Запускает фазу 1 (ярость → стекло)
    }
  }

  const getBossEnergyClass = () => {
    if (bossEnergy > 50) return 'green';
    if (bossEnergy > 20) return 'yellow';
    return 'red';
  };

  const startFight = () => {
    setShowIntro(false);
  };

  const isGameOver = gameStatus.includes('Победа') || gameStatus.includes('Поражение');

  // Стиль босса с анимациями
  const bossCurrentStyle = {
    ...bossImgStyle,
    ...(bossHit ? { filter: 'brightness(2) sepia(1) saturate(5) hue-rotate(-10deg)' } : {}),
    ...(bossRage
      ? {
          transform: 'scale(3.6) translate(0, 10px)',
          filter: 'brightness(1.5) drop-shadow(0 0 20px #ff0000)',
          border: '3px solid #ff0000',
          boxShadow: '0 0 40px rgba(255, 0, 0, 0.8)',
        }
      : {}),
  };

  // --- Экран-интро (показывается до начала боя) ---
  if (showIntro) {
    return (
      <div style={centerWrapperStyle}>
        <div style={mainWrapperStyle}>
          <h2 style={bossNameStyle}>⚠ БОСС ⚠</h2>
          <div className="TextOfPerson">
            <p style={styleText}>
              Все 30 уровней пройдены. Босс ждёт тебя.
              <br />
              Угадай все слова, чтобы его победить.
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

  // Пока localStorage не проверен — ничего не рендерим
  if (!isReady) return null;

  // --- Основной экран боя ---
  return (
    <div style={centerWrapperStyle}>
      <div style={mainWrapperStyle}>
        <h2 style={bossNameStyle}>⚠ БОСС ⚠</h2>

        {/* Изображение босса */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <img
            className={`zloysnow ${bossRage ? 'boss-rage' : ''}`}
            style={bossCurrentStyle}
            alt="Boss"
            src={bossImg}
          />
        </div>

        {/* Подсказка */}
        <div style={hintStyle}>Подсказка: {currentHint}</div>

        {/* Слово босса */}
        <div style={wrapperStyle}>
          {visible.map((isVisible, idx) => (
            <div key={idx} style={wordsStyle}>
              {isVisible ? currentWord[idx] : ''}
            </div>
          ))}
        </div>

        {/* Энергия босса */}
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

        {/* Алфавит */}
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

      {/* === ЭФФЕКТ РАЗБИТОГО СТЕКЛА === */}
      {/* Появляется после фазы ярости (400 мс), висит GLASS_DURATION мс */}
      {/* crackLevel = mistakes → 1-я ошибка → One.png, 2-я → Two.png, ... */}
      {glassShatter && (
        <RealisticBrokenGlass duration={GLASS_DURATION} crackLevel={mistakes} />
      )}
    </div>
  );
};

export default ToBoss;
