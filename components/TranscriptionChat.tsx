'use client';

import React, { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function TranscriptionChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente de transcrição. Que tipo de arquivo de áudio ou vídeo você quer transcrever hoje e qual o idioma dele?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mastra/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();
      
      if (response.ok && data.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Desculpe, não consegui me conectar com o servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[600px] border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm mt-8">
      {/* Header */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-zinc-800">Assistente de Transcrição</h2>
        <p className="text-sm text-zinc-500">Configure seu fluxo rapidamente</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-zinc-100 text-zinc-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 text-zinc-500 rounded-2xl rounded-bl-none px-5 py-3 flex space-x-2 items-center">
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-zinc-100">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua resposta..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-zinc-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
