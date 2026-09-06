import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import imgError from '../img/imgError.png';

const styleImgError = {
   width: '130%',
}
const styleHeader = {
    display: 'flex',
    flexWrap: 'wrap',
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    justifyContent: 'center',
    marginTop: '50px'
}
const textError = {
  color: '#ffffff',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '600',
  fontSize: '30px',
  margin: '5px',
  textAlign: 'center',
  overflow: "auto",
}

const ToError = () => {
  const navigate = useNavigate();
  
  const storedKey = localStorage.getItem('check');
  const [key, setKey] = useState(storedKey || '');
  const [count, setCount] = useState(20);

  const next = () => {
    if (count === 0) {
      localStorage.removeItem('check');
      if (key) {
        navigate('/' + key);
      } else {
        console.warn('Ключ не найден в localStorage');
      }
    }
  };

  useEffect(() => {
    if (count > 0) {
      const interval = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [count]);
  useEffect(() => {
    next();
  }, [count, next]);

  return (
    <main>
      <div style={styleHeader}>
         <img  style={styleImgError} src={imgError} alt="imgError"/>
        <p style={textError}>Ожидайте: </p>
        <div style={textError}>{count}</div>
      </div>
    </main>
  );
};

export default ToError;
