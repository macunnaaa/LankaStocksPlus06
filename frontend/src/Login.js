import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

/* ================================
   1. CSE QUIZ COMPONENT
================================ */
const Quiz = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const questions = [
    {
      q: "What is the full form of CSE?",
      a: "Colombo Stock Exchange",
      options: [
        "Central Stock Exchange",
        "Colombo Stock Exchange",
        "Ceylon Stock Equity"
      ]
    },
    {
      q: "Which index tracks the overall performance of CSE?",
      a: "ASPI",
      options: ["S&P SL20", "ASPI", "NASDAQ"]
    },
    {
      q: "What is the minimum age to invest in CSE?",
      a: "18",
      options: ["16", "18", "21"]
    },
    {
      q: "Which regulator oversees the capital market in Sri Lanka?",
      a: "SEC",
      options: ["SEC", "Central Bank", "CSE"]
    },
    {
      q: "What does 'Bull Market' mean?",
      a: "Stock prices are rising",
      options: [
        "Stock prices are falling",
        "Market is closed",
        "Stock prices are rising"
      ]
    },
    {
      q: "Which of these is a Blue Chip company in SL?",
      a: "John Keells Holdings",
      options: [
        "Local Grocery",
        "John Keells Holdings",
        "Start-up IT"
      ]
    },
    {
      q: "What is a 'Dividend'?",
      a: "Profit shared with shareholders",
      options: [
        "A type of tax",
        "Profit shared with shareholders",
        "A stock market loan"
      ]
    },
    {
      q: "ASPI stands for All Share ____ Index?",
      a: "Price",
      options: ["Profit", "Price", "Performance"]
    },
    {
      q: "When is the CSE usually open (Weekdays)?",
      a: "9:30 AM - 2:30 PM",
      options: [
        "9:00 AM - 5:00 PM",
        "10:00 AM - 4:00 PM",
        "9:30 AM - 2:30 PM"
      ]
    },
    {
      q: "What do you need to start trading in CSE?",
      a: "CDS Account",
      options: [
        "CDS Account",
        "Fixed Deposit",
        "Facebook Account"
      ]
    }
  ];

  const handleAnswer = (option) => {
    setSelectedOption(option);
    const correct = option === questions[currentStep].a;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentStep + 1 < questions.length) {
        setCurrentStep(currentStep + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  if (showResult) {
    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#00ff7f20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #00ff7f40', boxShadow: '0 0 20px rgba(0, 255, 127, 0.3)' }}>
                <Sparkles size={32} color="#00ff7f" />
            </div>
        </div>
        <h2 style={{ color: '#00ff7f', fontSize: '28px', fontWeight: '900', textShadow: '0 0 10px rgba(0, 255, 127, 0.3)' }}>Quiz Completed! 🎉</h2>
        <p style={{ fontSize: '22px', margin: '20px 0', color: 'white' }}>
          Your Knowledge Score: <span style={{ color: '#00ff7f' }}><b>{score} / 10</b></span>
        </p>
        <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '14px' }}>
          Great job! You are now ready to start your trading journey.
        </p>
        <button onClick={onComplete} style={styles.primaryBtn}>
          ENTER DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <p style={{ color: '#00ff7f', fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>
        STEP {currentStep + 1} OF 10
      </p>

      <h3 style={{ fontSize: '20px', margin: '20px 0', color: 'white', fontWeight: '700' }}>
        {questions[currentStep].q}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {questions[currentStep].options.map((opt, index) => (
          <button
            key={index}
            disabled={selectedOption !== null}
            onClick={() => handleAnswer(opt)}
            style={{
              ...styles.optionBtn,
              backgroundColor:
                selectedOption === opt
                  ? isCorrect
                    ? '#00ff7f'
                    : '#ef4444'
                  : selectedOption && opt === questions[currentStep].a
                  ? '#00ff7f'
                  : '#0f172a',
              color: selectedOption ? '#020617' : '#94a3b8',
              borderColor: selectedOption ? 'transparent' : '#1e293b',
              boxShadow: selectedOption === opt && isCorrect ? '0 0 15px rgba(0, 255, 127, 0.4)' : 'none'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ================================
   2. LOGIN / REGISTER COMPONENT
================================ */
const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // --- 🚀 NEW NOTIFICATION STATE ---
  const [notification, setNotification] = useState({ show: false, msg: "", type: "" });

  //  useEffect )
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, msg: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const triggerNotify = (msg, type) => {
    setNotification({ show: true, msg, type });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setFullName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/login/',
          { username, password }
        );

        if (response.status === 200) {
          triggerNotify("Login Successful! Redirecting...", "success");
          setTimeout(() => onLogin(), 1000);
        }
      } else {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/register/',
          { username, password }
        );

        if (response.status === 201) {
          triggerNotify("Registration Successful! Start Quiz.", "success");
          setTimeout(() => setShowQuiz(true), 1500);
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Connection Error! Please try again.";
      triggerNotify(errorMsg, "error");
    }
  };

  const stylesBrand = {
    brandWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '10px'
    },
    brandMainText: {
      fontSize: '24px',
      fontWeight: '900',
      letterSpacing: '1px'
    },
    brandSubText: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#f0b90b',
      letterSpacing: '3px',
      textShadow: '0 0 10px rgba(240, 185, 11, 0.3)'
    }
  };

  if (showQuiz) {
    return (
      <div style={styles.container}>
        <div style={styles.glowBg1} />
        <div style={styles.glowBg2} />
        <Quiz onComplete={onLogin} />
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/*  globalStyles  */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* --- 🔔 LATEST NOTIFICATION UI --- */}
      {notification.show && (
        <div style={{
          ...styles.notifyOverlay,
          backgroundColor: notification.type === "success" ? "#00ff7f" : "#ef4444"
        }}>
          {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: '700', fontSize: '14px' }}>{notification.msg}</span>
        </div>
      )}

      <div style={styles.glowBg1} />
      <div style={styles.glowBg2} />
      
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={stylesBrand.brandWrapper}>
            <div style={stylesBrand.brandMainText}>
                <span style={{ color: 'white' }}>LANKA</span>
                <span style={{ color: '#00ff7f', marginLeft: '6px' }}>STOCKS</span>
            </div>
            <span style={stylesBrand.brandSubText}>PLUS+</span>
          </div>
          <p style={styles.tagline}>
            The Best Virtual Trading Experience in SL
          </p>
        </div>

        <h2 style={styles.title}>
          {isLogin ? 'Login to Account' : 'Create New Account'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                style={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}

            <input
              type="text"
              placeholder="Username"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.primaryBtn}>
            {isLogin ? 'LOGIN NOW' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={toggleForm} style={styles.link}>
            {isLogin ? ' Register Now' : ' Login Here'}
          </span>
        </p>
      </div>
    </div>
  );
};

/* ================================
   STYLES
================================ */
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020804',
    fontFamily: 'Inter, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  notifyOverlay: {
    position: 'fixed',
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: '12px',
    color: '#020617',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 9999,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    animation: 'slideDown 0.4s ease-out forwards'
  },
  glowBg1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '450px',
    height: '450px',
    backgroundColor: '#00ff7f15',
    borderRadius: '50%',
    filter: 'blur(100px)',
    pointerEvents: 'none',
    zIndex: 0
  },
  glowBg2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '400px',
    height: '400px',
    backgroundColor: '#00ff7f10',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
    zIndex: 0
  },
  card: {
    backgroundColor: 'rgba(10, 18, 11, 0.8)',
    backdropFilter: 'blur(15px)',
    padding: '50px 40px',
    borderRadius: '32px',
    border: '1px solid rgba(0, 255, 127, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 127, 0.05)',
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  },
  tagline: {
    color: '#64748b',
    fontSize: '13px',
    marginTop: '10px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '30px',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.9
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    marginBottom: '15px',
    borderRadius: '16px',
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#00ff7f',
    color: '#020617',
    border: 'none',
    borderRadius: '16px',
    fontWeight: '900',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 25px rgba(0, 255, 127, 0.3)',
    letterSpacing: '1px'
  },
  optionBtn: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    border: '1px solid #1e293b',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  switchText: {
    marginTop: '30px',
    color: '#64748b',
    fontSize: '14px'
  },
  link: {
    color: '#00ff7f',
    fontWeight: '800',
    cursor: 'pointer',
    marginLeft: '5px',
    textShadow: '0 0 8px rgba(0, 255, 127, 0.2)'
  }
};

export default Login;