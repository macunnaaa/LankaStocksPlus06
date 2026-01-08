import React, { useState } from 'react';

const Quiz = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    const questions = [
        { q: "What is the full form of CSE?", a: "Colombo Stock Exchange", options: ["Central Stock Exchange", "Colombo Stock Exchange", "Ceylon Stock Equity"] },
        { q: "Which index tracks the overall performance of CSE?", a: "ASPI", options: ["S&P SL20", "ASPI", "NASDAQ"] },
        { q: "What is the minimum age to invest in CSE?", a: "18", options: ["16", "18", "21"] },
        { q: "Which regulator oversees the capital market in Sri Lanka?", a: "SEC", options: ["SEC", "Central Bank", "CSE"] },
        { q: "What does 'Bull Market' mean?", a: "Stock prices are rising", options: ["Stock prices are falling", "Market is closed", "Stock prices are rising"] },
        { q: "Which of these is a Blue Chip company in SL?", a: "John Keells Holdings", options: ["Local Grocery", "John Keells Holdings", "Start-up IT"] },
        { q: "What is a 'Dividend'?", a: "Profit shared with shareholders", options: ["A type of tax", "Profit shared with shareholders", "A stock market loan"] },
        { q: "ASPI stands for All Share ____ Index?", a: "Price", options: ["Profit", "Price", "Performance"] },
        { q: "When is the CSE usually open (Weekdays)?", a: "9:30 AM - 2:30 PM", options: ["9:00 AM - 5:00 PM", "10:00 AM - 4:00 PM", "9:30 AM - 2:30 PM"] },
        { q: "What do you need to start trading in CSE?", a: "CDS Account", options: ["CDS Account", "Fixed Deposit", "Facebook Account"] }
    ];

    const handleAnswer = (option) => {
        setSelectedOption(option);
        const correct = option === questions[currentStep].a;
        setIsCorrect(correct);
        if (correct) setScore(score + 1);

        setTimeout(() => {
            if (currentStep + 1 < questions.length) {
                setCurrentStep(currentStep + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    if (showResult) {
        return (
            <div style={styles.quizCard}>
                <h2>Quiz Completed! 🎉</h2>
                <p style={{fontSize: '24px'}}>Your Score: <b>{score} / 10</b></p>
                <button onClick={onComplete} style={styles.startBtn}>Enter Dashboard</button>
            </div>
        );
    }

    return (
        <div style={styles.quizCard}>
            <p style={styles.progress}>Question {currentStep + 1} of 10</p>
            <h3 style={styles.questionText}>{questions[currentStep].q}</h3>
            <div style={styles.optionsGrid}>
                {questions[currentStep].options.map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => !selectedOption && handleAnswer(opt)}
                        style={{
                            ...styles.optionBtn,
                            backgroundColor: selectedOption === opt 
                                ? (isCorrect ? '#10b981' : '#ef4444') 
                                : (selectedOption && opt === questions[currentStep].a ? '#10b981' : 'white'),
                            color: selectedOption ? 'white' : '#374151'
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const styles = {
    quizCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '500px', width: '90%' },
    progress: { color: '#6b7280', fontSize: '14px' },
    questionText: { fontSize: '20px', marginBottom: '25px', color: '#111827' },
    optionsGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    optionBtn: { padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: '0.3s' },
    startBtn: { backgroundColor: '#059669', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }
};

export default Quiz;