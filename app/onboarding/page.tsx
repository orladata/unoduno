import React from 'react';
import TranscriptionChat from '../../components/TranscriptionChat';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center pt-16 px-4">
      <div className="max-w-2xl w-full text-center space-y-4">
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Criar Fluxo de Transcrição</h1>
        <p className="text-lg text-zinc-600">
          Nosso assistente virtual vai te guiar para configurar a sua primeira tarefa de transcrição.
          Basta responder às perguntas abaixo!
        </p>
      </div>

      <TranscriptionChat />
    </div>
  );
}
