'use client';
import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Welcome to VendorCheck AI Copilot. I can analyze risk metrics, explain Section 164(2) director disqualifications, summarize sentiment from 100+ journals, or draft vendor audit memos. What entity would you like to discuss?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.reply || 'No response returned.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Unable to process query. Status: ${res.status}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Connection error: ${err.message || 'Server unreachable'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, fontFamily: 'Outfit, Inter, sans-serif' }}>
      
      {/* Chat Window Container */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '520px',
          backgroundColor: '#0e1422',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '1.25rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
          overflow: 'hidden',
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Window Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            padding: '1.1rem 1.25rem',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>VendorCheck AI Copilot</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  Live Compliance Assistant
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#090d16' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#131d33',
                  color: m.role === 'user' ? '#fff' : '#f1f5f9',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '0.8rem 1rem',
                  borderRadius: '1rem',
                  borderBottomRightRadius: m.role === 'user' ? '0.2rem' : '1rem',
                  borderBottomLeftRadius: m.role === 'assistant' ? '0.2rem' : '1rem',
                  fontSize: '0.86rem',
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  whiteSpace: 'pre-line'
                }}
              >
                {m.content}
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#131d33', border: '1px solid rgba(255,255,255,0.08)', padding: '0.6rem 0.9rem', borderRadius: '1rem', borderBottomLeftRadius: '0.2rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulseGlow 0.8s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulseGlow 0.8s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulseGlow 0.8s infinite 0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '0.5rem 1rem', background: '#0e1422', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {['Explain Trust Score', 'What is Sec 164(2)?', 'Summarize News'].map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(prompt);
                }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ padding: '0.85rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0e1422', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about compliance or legal risks..."
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: '#090d16',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: input.trim() ? 'pointer' : 'default',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Pulsing Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #38bdf8 100%)',
          color: '#fff',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.6), 0 0 20px rgba(56, 189, 248, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          float: 'right',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
