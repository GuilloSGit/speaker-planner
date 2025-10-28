import React, { useState } from 'react';
import { Speaker } from '@/types';
import { TalkItem } from './TalkItem';
import { MASTER_TALKS } from '@/lib/constants';

interface SpeakerCardProps {
  speaker: Speaker;
  onToggleAvailability: (speakerId: string, currentAvailability: boolean) => void;
  onChangeRole: (speakerId: string, newRole: string) => void;
  onUpdatePhone: (speakerId: string, newPhone: string) => void;
  onRemove: (speakerId: string) => void;
  onToggleTalkAvailability: (speakerId: string, talkId: number, currentAvailability: boolean) => void;
  onRemoveTalk: (speakerId: string, talkId: number) => void;
  onAddTalk: (speakerId: string, talkId: string) => void;
  SPEAKER_ROLES: Array<{ value: string; label: string }>;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({
  speaker,
  onToggleAvailability,
  onChangeRole,
  onUpdatePhone,
  onRemove,
  onToggleTalkAvailability,
  onRemoveTalk,
  onAddTalk,
  SPEAKER_ROLES,
}) => {
  const [isAddingTalk, setIsAddingTalk] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newTalkId, setNewTalkId] = useState('');
  const [editingPhone, setEditingPhone] = useState(speaker.phone || '');

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-6">
      <div className="flex items-start justify-between border-b pb-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span 
              className={`text-2xl transition-colors ${speaker.available ? 'text-green-500' : 'text-red-500'} cursor-pointer select-none`}
              onClick={() => onToggleAvailability(speaker.id, speaker.available)}
            >
              {speaker.available ? '🟢' : '🔴'}
            </span>
            <h3 className="text-xl font-bold text-gray-800 select-none">
              {speaker.family_name}, {speaker.first_name}
            </h3>
          </div>
          {!isEditingPhone ? (
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <span>{'+54 ' + speaker.phone || 'Sin teléfono'}</span>
              <button 
                onClick={() => {
                  setEditingPhone(speaker.phone || '');
                  setIsEditingPhone(true);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
              >
                Editar
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="tel"
                value={editingPhone}
                onChange={(e) => setEditingPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className="text-sm px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-600"
              />
              <button 
                onClick={() => {
                  onUpdatePhone(speaker.id, editingPhone);
                  setIsEditingPhone(false);
                }}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                ✓
              </button>
              <button 
                onClick={() => {
                  setIsEditingPhone(false);
                  setEditingPhone(speaker.phone || '');
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <select
            value={speaker.role}
            onChange={(e) => onChangeRole(speaker.id, e.target.value)}
            className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 focus:ring-blue-500 focus:border-blue-500"
          >
            {SPEAKER_ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onToggleAvailability(speaker.id, speaker.available)}
            className={`px-3 py-1 text-xs font-semibold cursor-pointer rounded-full transition-colors ${
              speaker.available
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {speaker.available ? 'Cambiar a No Disponible' : 'Cambiar a Disponible'}
          </button>
          <button
            onClick={() => onRemove(speaker.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar conferenciante"
          >
            <span className="text-red-500 cursor-pointer">🗑️</span>
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-gray-600 mb-2 mt-4">
        Discursos: ({speaker.talks.length})
      </h4>
      <div className="bg-gray-50 border rounded-lg max-h-60 overflow-y-auto mb-4">
        {speaker.talks.length > 0 ? (
          speaker.talks.map(talk => (
            <TalkItem
              key={`${speaker.id}-${talk.id}`}
              speakerId={speaker.id}
              talk={talk}
              onToggleAvailability={(talkId, currentAvailability) => onToggleTalkAvailability(speaker.id, talkId, currentAvailability)}
              onRemove={(talkId) => onRemoveTalk(speaker.id, talkId)}
            />
          ))
        ) : (
          <p className="p-3 text-sm text-gray-500 italic">
            No hay discursos asociados.
          </p>
        )}
      </div>

      <div className="mt-4">
        {isAddingTalk ? (
          <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-lg border">
            <input
              type="number"
              min="1"
              id="master-talks"
              list="master-talks"
              value={newTalkId}
              onChange={(e) => setNewTalkId(e.target.value)}
              placeholder="Número"
              className="px-3 py-1 border rounded text-sm w-36 focus:ring-blue-500 focus:border-blue-500 text-blue-600"
            />
            <datalist id="master-talks">
              {MASTER_TALKS.map(talk => (
                <option key={talk.id} value={talk.id}>{talk.title}</option>
              ))}
            </datalist>
            {newTalkId && <p className="text-white text-xl animate-bounce hover:animate-none">👆🏽</p>}
            <button
              onClick={() => {
                onAddTalk(speaker.id, newTalkId);
                setNewTalkId('');
                setIsAddingTalk(false);
              }}
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition duration-150"
              disabled={!newTalkId}
            >
              + Añadir 
            </button>
            <button
              onClick={() => {
                setNewTalkId('');
                setIsAddingTalk(false);
              }}
              className="text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTalk(true)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            + Añadir discurso por número
          </button>
        )}
      </div>
    </div>
  );
};
