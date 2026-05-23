import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [lastMsgIdx, setLastMsgIdx] = useState(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setLastMsgIdx(messages.length - 1);
  }, [messages]);

  // Vibrant background that follows the cursor and text animations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'navi-cursor-bg-style';
    style.innerHTML = `
      @keyframes navi-wave {
        0%, 100% { transform: translateY(0); }
        20% { transform: translateY(-6px); }
        40% { transform: translateY(2px); }
        60% { transform: translateY(-4px); }
        80% { transform: translateY(1px); }
      }
      .navi-send-btn-text span {
        display: inline-block;
        transition: color 0.2s;
      }
      .navi-send-btn:hover .navi-send-btn-text span {
        animation: navi-wave 0.7s infinite;
        animation-delay: calc(var(--i) * 0.07s);
        color: #00e0ff;
        text-shadow: 0 2px 8px #00e0ff99;
      }
      @keyframes navi-dots {
        0% { opacity: 1; }
        20% { opacity: 0.2; }
        40% { opacity: 1; }
        100% { opacity: 1; }
      }
      .navi-dots span {
        animation: navi-dots 1s infinite;
      }
      .navi-dots span:nth-child(2) { animation-delay: 0.2s; }
      .navi-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes navi-pop-in {
        0% { transform: scale(0.7); opacity: 0; }
        60% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes navi-bot-fade-in {
        0% { opacity: 0; transform: translateX(-30px); }
        60% { opacity: 1; transform: translateX(8px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      .navi-user-anim {
        animation: navi-pop-in 0.5s cubic-bezier(.68,-0.55,.27,1.55);
      }
      .navi-bot-anim {
        animation: navi-bot-fade-in 0.7s cubic-bezier(.68,-0.55,.27,1.55);
      }
    `;
    document.head.appendChild(style);

    function setGradient(x, y) {
      style.innerHTML += `
        body {
          min-height: 100vh;
          background: radial-gradient(
            600px at ${x}px ${y}px,
            #fff17655 0%,
            #ff6a00cc 20%,
            #ee0979cc 40%,
            #00c3ffcc 60%,
            #43e97bcc 80%,
            #38f9d7cc 100%
          ),
          linear-gradient(135deg, #ff6a00 0%, #ee0979 25%, #00c3ff 50%, #43e97b 75%, #38f9d7 100%);
          background-blend-mode: lighten, normal;
          background-size: 100% 100%;
        }
      `;
    }

    setGradient(window.innerWidth / 2, window.innerHeight / 2);

    function handleMouseMove(e) {
      setGradient(e.clientX, e.clientY);
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.head.removeChild(style);
    };
  }, []);

  // Helper to animate send button text
  const renderSendText = () => {
    const text = 'Send';
    return (
      <span className="navi-send-btn-text">
        {text.split('').map((char, i) => (
          <span key={i} style={{ '--i': i }}>{char}</span>
        ))}
      </span>
    );
  };

  // Helper to animate loading dots
  const renderLoadingDots = () => (
    <span className="navi-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  );

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setInput('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: userMsg.text })
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: data.response || data.message || String(data) }
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: 'Sorry, there was an error. Please try again.' }
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 520,
        width: '100%',
        margin: '40px auto',
        borderRadius: 24,
        boxShadow: '0 8px 40px 0 #0006, 0 1.5px 8px #007bff33',
        background: 'rgba(36, 40, 54, 0.75)',
        backdropFilter: 'blur(16px) saturate(160%)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '90vh',
        maxHeight: 600,
        minHeight: 480,
        overflow: 'hidden',
      }}>
        {/* Header with logo and chatbot name */}
        <div style={{
          width: '100%',
          padding: '18px 0 10px 0',
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1.5px solid rgba(255,255,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          userSelect: 'none',
        }}>
          <img
            src={process.env.PUBLIC_URL + '/NavigateLabs-CIR.png'}
            alt="Navigate Labs CIR Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 0 0 4px #fff2, 0 0 16px 2px #00c3ff77',
              background: '#fff',
              border: '2.5px solid #fff',
              marginRight: 0,
            }}
          />
          <span style={{
            fontWeight: 900,
            fontSize: '2.1rem',
            letterSpacing: 2,
            color: '#fff',
            textShadow: '0 2px 16px #00c3ff99, 0 1px 2px #0008',
            boxShadow: '0 2px 12px #00c3ff33',
            lineHeight: 1.1,
          }}>
            NAVI CHAT
          </span>
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 28,
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          {messages.map((msg, i) => (
            <div
              key={i + '-' + msg.text.slice(0, 10)}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                className={
                  i === lastMsgIdx
                    ? msg.sender === 'user'
                      ? 'navi-user-anim'
                      : 'navi-bot-anim'
                    : ''
                }
                style={{
                  background: msg.sender === 'user'
                    ? 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)'
                    : 'rgba(52, 53, 65, 0.85)',
                  color: msg.sender === 'user' ? '#fff' : '#e6e6e6',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '16px 22px',
                  maxWidth: '75%',
                  fontSize: 17,
                  boxShadow: msg.sender === 'user'
                    ? '0 2px 12px #007bff44, 0 1.5px 8px #007bff33'
                    : '0 2px 8px #0002',
                  marginLeft: msg.sender === 'user' ? 40 : 0,
                  marginRight: msg.sender === 'user' ? 0 : 40,
                  transition: 'background 0.2s',
                  wordBreak: 'break-word',
                  backdropFilter: msg.sender === 'user' ? undefined : 'blur(2px)',
                  border: msg.sender === 'user' ? '1.5px solid #007bff55' : '1.5px solid #343541',
                  opacity: 0.97,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form
          onSubmit={sendMessage}
          style={{
            display: 'flex',
            borderTop: '1.5px solid #343541',
            background: 'rgba(36, 40, 54, 0.85)',
            padding: 18,
            gap: 14,
            boxShadow: '0 -2px 12px #0002',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 17,
              padding: '16px 20px',
              borderRadius: 14,
              background: 'rgba(52, 53, 65, 0.92)',
              color: '#fff',
              boxShadow: '0 2px 8px #0002',
              transition: 'box-shadow 0.2s',
              borderBottom: '2.5px solid #007bff55',
              marginRight: 0,
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="navi-send-btn"
            style={{
              padding: '0 32px',
              border: 'none',
              background: loading
                ? 'linear-gradient(90deg, #444 60%, #222 100%)'
                : 'linear-gradient(90deg, #007bff 60%, #00e0ff 100%)',
              color: '#fff',
              borderRadius: 14,
              fontSize: 18,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading
                ? '0 2px 8px #2222'
                : '0 0 16px 2px #00e0ff55, 0 2px 8px #007bff33',
              transition: 'background 0.2s, box-shadow 0.2s',
              letterSpacing: 1,
              textShadow: loading ? 'none' : '0 1px 8px #00e0ff44',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {loading ? renderLoadingDots() : renderSendText()}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot; 