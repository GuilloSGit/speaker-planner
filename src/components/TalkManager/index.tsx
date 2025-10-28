'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpeakerCard } from './SpeakerCard';
import { Alert } from './Alert';
import { Speaker } from '@/types';
import { MASTER_TALKS, SPEAKER_ROLES, getTalksPath } from '@/lib/constants';
import { auth, db, doc, setDoc, collection, onSnapshot, query, addDoc, deleteDoc, signInAnonymously } from '@/lib/firebase';

const TalkManager: React.FC = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [newSpeakerName, setNewSpeakerName] = useState({ first: '', family: '' });
  const [newSpeakerPhone, setNewSpeakerPhone] = useState('');
  const [newSpeakerRole, setNewSpeakerRole] = useState(SPEAKER_ROLES[0].value);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<string | null>(null);

  // Efecto para autenticación
  useEffect(() => {
    console.log('Iniciando efecto de autenticación');

    const handleAuthStateChanged = async (user: any) => {

      if (user) {
        setUserId(user.uid);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUserId(userCredential.user?.uid || null);
        } catch (error) {
          console.error('Error en autenticación anónima:', error);
          setAlertMessage('Error al conectar con el servidor. Por favor, recarga la página.');
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged(
      handleAuthStateChanged,
      (error) => {
        console.error('Error en el observador de autenticación:', error);
        setAlertMessage('Error al verificar la sesión. Por favor, recarga la página.');
      }
    );

    return () => {
      console.log('Limpiando efecto de autenticación');
      unsubscribe();
    };
  }, []);

  // Efecto para cargar los datos de Firestore
  useEffect(() => {
    if (!userId) {
      return;
    }

    const talksPath = getTalksPath(userId);

    try {
      const q = query(collection(db, talksPath));

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const speakersData: Speaker[] = [];
          snapshot.forEach((doc) => {
            speakersData.push({ id: doc.id, ...doc.data() } as Speaker);
          });
          setSpeakers(speakersData);
          setIsLoading(false);
        },
        (error: any) => {
          console.error('Error al cargar datos de Firestore:', error);
          console.error('Código de error:', error.code);
          console.error('Mensaje de error:', error.message);
          setAlertMessage(`Error al cargar los datos: ${error.message}`);
          setIsLoading(false);
        }
      );

      return () => {
        console.log('Limpiando suscripción a Firestore');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error al configurar la consulta a Firestore:', error);
      setAlertMessage('Error al configurar la conexión con la base de datos.');
      setIsLoading(false);
    }
  }, [userId]);

  const handleShare = () => {
    const output = shareableOutput;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(output)}`;
    window.open(whatsappLink, '_blank');
  };

  // Función para actualizar un conferenciante
  const updateSpeaker = useCallback(async (speakerId: string, data: Partial<Speaker>) => {
    if (!userId) return;

    try {
      const speakerRef = doc(db, getTalksPath(userId), speakerId);
      await setDoc(speakerRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating speaker:", error);
      setAlertMessage("Error al actualizar el conferenciante.");
    }
  }, [userId]);

  // Manejadores de eventos
  const handleToggleAvailability = useCallback((speakerId: string, currentAvailability: boolean) => {
    updateSpeaker(speakerId, { available: !currentAvailability });
  }, [updateSpeaker]);

  const handleChangeRole = useCallback((speakerId: string, newRole: string) => {
    updateSpeaker(speakerId, { role: newRole });
  }, [updateSpeaker]);

  const handleUpdatePhone = useCallback((speakerId: string, newPhone: string) => {
    updateSpeaker(speakerId, { phone: newPhone });
  }, [updateSpeaker]);

  const handleAddSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newSpeakerName.first.trim() || !newSpeakerName.family.trim()) {
      setAlertMessage("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      await addDoc(collection(db, getTalksPath(userId)), {
        first_name: newSpeakerName.first.trim(),
        family_name: newSpeakerName.family.trim(),
        phone: newSpeakerPhone.trim(),
        role: newSpeakerRole,
        available: true,
        talks: [],
      });
      setNewSpeakerName({ first: '', family: '' });
      setNewSpeakerPhone('');
      setNewSpeakerRole(SPEAKER_ROLES[0].value);
    } catch (error) {
      console.error("Error adding speaker:", error);
      setAlertMessage("Error al agregar el conferenciante.");
    }
  };

  const handleRemoveClick = (speakerId: string) => {
    setSpeakerToDelete(speakerId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userId || !speakerToDelete) return;

    try {
      await deleteDoc(doc(db, getTalksPath(userId), speakerToDelete));
      setShowDeleteDialog(false);
      setSpeakerToDelete(null);
    } catch (error) {
      console.error("Error removing speaker:", error);
      setAlertMessage("Error al eliminar el conferenciante.");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setSpeakerToDelete(null);
  };

  const handleToggleTalkAvailability = useCallback((speakerId: string, talkId: number, currentAvailability: boolean) => {
    const speaker = speakers.find(s => s.id === speakerId);
    if (!speaker) return;

    const updatedTalks = speaker.talks.map(talk =>
      talk.id === talkId ? { ...talk, available: !currentAvailability } : talk
    );

    updateSpeaker(speakerId, { talks: updatedTalks });
  }, [speakers]);

  const handleAddTalk = useCallback((speakerId: string, talkIdStr: string) => {
    const talkId = parseInt(talkIdStr, 10);
    if (isNaN(talkId) || !MASTER_TALKS.some(t => t.id === talkId)) {
      setAlertMessage("ID de discurso inválido.");
      return;
    }

    const speaker = speakers.find(s => s.id === speakerId);
    if (!speaker) return;

    if (speaker.talks.some(t => t.id === talkId)) {
      setAlertMessage("Este discurso ya está asignado a este conferenciante.");
      return;
    }

    const updatedTalks = [...speaker.talks, { id: talkId, available: true }];
    updateSpeaker(speakerId, { talks: updatedTalks });
  }, [speakers, updateSpeaker]);

  const handleRemoveTalk = useCallback((speakerId: string, talkId: number) => {
    const speaker = speakers.find(s => s.id === speakerId);
    if (!speaker) return;

    const updatedTalks = speaker.talks.filter(talk => talk.id !== talkId);
    updateSpeaker(speakerId, { talks: updatedTalks });
  }, [speakers, updateSpeaker]);

  // Generar el output compartible
  const shareableOutput = useMemo(() => {
    if (isLoading) return "Cargando datos...";
    if (speakers.length === 0) return "No hay conferenciantes registrados.";

    let output = "=== LISTA DE CONFERENCIANTES ===\n\n";

    // Agrupar por rol
    const groupedSpeakers = speakers.reduce((acc, speaker) => {
      if (!acc[speaker.role]) {
        acc[speaker.role] = [];
      }
      acc[speaker.role].push(speaker);
      return acc;
    }, {} as Record<string, Speaker[]>);

    // Ordenar los grupos (Ancianos primero, luego Siervos Ministeriales, luego el resto)
    const sortedGroups = Object.entries(groupedSpeakers).sort(([roleA], [roleB]) => {
      if (roleA === 'Anciano') return -1;
      if (roleB === 'Anciano') return 1;
      if (roleA === 'Siervo Ministerial') return -1;
      if (roleB === 'Siervo Ministerial') return 1;
      return roleA.localeCompare(roleB);
    });

    // Generar el texto para cada grupo
    sortedGroups.forEach(([role, roleSpeakers]) => {
      output += `=== ${role.toUpperCase()}S ===\n`;

      // Ordenar por apellido
      const sortedSpeakers = [...roleSpeakers].sort((a, b) =>
        a.family_name.localeCompare(b.family_name)
      );

      // Filtrar oradores que tengan al menos un discurso disponible
      const speakersWithTalks = sortedSpeakers.filter(speaker => {
        if (!speaker.available) return false;
        return speaker.talks.some(talk => talk.available);
      });

      speakersWithTalks.forEach(speaker => {
        // Agregar nombre y teléfono
        output += `\n${speaker.family_name}, ${speaker.first_name}`;
        if (speaker.phone) {
          output += ` ( +${speaker.phone} )`;
        }
        output += ":\n";

        // Agregar discursos disponibles
        const availableTalks = speaker.talks
          .filter(talk => talk.available)
          .sort((a, b) => a.id - b.id);

        availableTalks.forEach(talk => {
          const talkInfo = MASTER_TALKS.find(t => t.id === talk.id);
          output += `  - ${talk.id} - ${talkInfo?.title || 'Título no encontrado'}\n`;
        });
      });

      output += "\n";
    });

    output += `\nActualizado: ${new Date().toLocaleString()}`;
    return output;
  }, [speakers, isLoading]);

  // Renderizado
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mt-2 mx-6">
        <header className="mb-4 fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-3xl font-bold">Gestor de Conferencias</h1>
          <p className="text-gray-200">Administra los conferenciantes y sus discursos para compartir</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-20">
          {/* Panel de gestión */}
          <div className="lg:col-span-1 space-y-8">
            {/* Formulario para agregar nuevo conferenciante */}
            <section className="bg-white p-4 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Agregar Nuevo Conferenciante</h2>
              <form onSubmit={handleAddSpeaker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      value={newSpeakerName.first}
                      onChange={(e) => setNewSpeakerName(prev => ({ ...prev, first: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="family-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="family-name"
                      value={newSpeakerName.family}
                      onChange={(e) => setNewSpeakerName(prev => ({ ...prev, family: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={'+54 ' + newSpeakerPhone}
                      onChange={(e) => setNewSpeakerPhone(e.target.value)}
                      placeholder="11 1234-5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      id="role"
                      value={newSpeakerRole}
                      onChange={(e) => setNewSpeakerRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    >
                      {SPEAKER_ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  disabled={!newSpeakerName.first || !newSpeakerName.family}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:pointer"
                >
                  Agregar Conferenciante
                </button>
              </form>
            </section>

            {/* Lista de conferenciantes */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-600">Conferenciantes</h2>
                <span className="text-sm text-gray-500">{speakers.length} registrados</span>
              </div>

              {speakers.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">
                  No hay conferenciantes registrados. Agrega uno para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  {speakers.reverse().map(speaker => (
                    <SpeakerCard
                      key={speaker.id}
                      speaker={speaker}
                      onToggleAvailability={handleToggleAvailability}
                      onChangeRole={handleChangeRole}
                      onRemove={() => handleRemoveClick(speaker.id)}
                      onToggleTalkAvailability={handleToggleTalkAvailability}
                      onRemoveTalk={handleRemoveTalk}
                      onAddTalk={handleAddTalk}
                      onUpdatePhone={handleUpdatePhone}
                      SPEAKER_ROLES={SPEAKER_ROLES}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Panel de vista previa */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="xl:bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Vista Previa</h2>
              <p className="text-sm text-gray-600 mb-4">
                Este es el formato que se compartirá con los demás.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {shareableOutput}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareableOutput);
                  setAlertMessage("¡Listado copiado al portapapeles!");
                  handleShare();
                }}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Enviarlo por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertMessage && (
        <Alert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Diálogo de confirmación de eliminación */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar a este conferenciante? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalkManager;
