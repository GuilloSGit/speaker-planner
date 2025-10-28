import React from 'react';
import { MASTER_TALKS } from '@/lib/constants';

interface TalkItemProps {
  speakerId: string;
  talk: {
    id: number;
    available?: boolean;
  };
  onToggleAvailability: (talkId: number, currentAvailability: boolean) => void;
  onRemove: (talkId: number) => void;
}

export const TalkItem: React.FC<TalkItemProps> = ({ 
  speakerId, 
  talk, 
  onToggleAvailability, 
  onRemove 
}) => {
  const talkInfo = MASTER_TALKS.find(t => t.id === talk.id);
  
  if (!talkInfo) return null;

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0 group">
      <div className="flex items-center flex-1">
        <span className="font-mono text-sm w-8 mr-2 text-gray-500">{talk.id}</span>
        <span className="text-gray-700 text-sm flex-1">{talkInfo.title}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggleAvailability(talk.id, !!talk.available)}
          className={`p-1 rounded-full transition-colors cursor-pointer text-xs ${
            talk.available ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
          title={talk.available ? "Marcar como no disponible" : "Marcar como disponible"}
        >
          {talk.available ? '✅ Disponible' : '❌ No disponible'}
        </button>
        <button
          onClick={() => onRemove(talk.id)}
          className="opacity-50 hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity text-xl"
          title="Quitar discurso del conferenciante"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
