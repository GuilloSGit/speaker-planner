'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpeakerCard } from './SpeakerCard';
import { PlusIcon, ShareIcon, DocumentDuplicateIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Speaker } from '@/types';
import { MASTER_TALKS, SPEAKER_ROLES, getTalksPath } from '@/lib/constants';
import { auth, db, doc, setDoc, getDoc, collection, onSnapshot, query, addDoc, deleteDoc, signInAnonymously } from '@/lib/firebase';
import ConferencePdf from '../ConferenceFlyer/ConferenceFlyer';
import { ConfirmationDialog } from './ConfirmationDialog';
import { Alert } from './Alert';
import { serverTimestamp } from 'firebase/firestore';

const TalkManager: React.FC = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [congregation, setCongregation] = useState('');
  const [newSpeakerName, setNewSpeakerName] = useState({ first: '', family: '' });
  const [newSpeakerPhone, setNewSpeakerPhone] = useState('');
  const [newSpeakerRole, setNewSpeakerRole] = useState(SPEAKER_ROLES[0].value);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<string | null>(null);
  const [importData, setImportData] = useState<Speaker[]>([]);
  const [addDateStamp, setAddDateStamp] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [meetingDay, setMeetingDay] = useState('sabado');
  const [meetingTime, setMeetingTime] = useState('18:00');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Efecto para verificar el documento de Firestore

  useEffect(() => {
    if (userId) {
      const userDoc = doc(db, 'users', userId);
      getDoc(userDoc).then(doc => {
      });
    }
  }, [userId]);

  // Efecto para autenticación
  useEffect(() => {
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
      unsubscribe();
    };
  }, []);

  // Función para guardar la configuración en Firestore
  const saveConfig = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const configRef = doc(db, 'users', userId);

      await setDoc(configRef, {
        config: {
          congregation,
          contactName,
          contactPhone,
          meetingDay,
          meetingTime,
          addDateStamp,
          googleMapsUrl,
          updatedAt: serverTimestamp()
        }
      }, { merge: true });
    } catch (error) {
      console.error('❌ Error al guardar la configuración:', error);
      setAlertMessage('Error al guardar la configuración: ' + (error as Error).message);
    }
  }, [userId, congregation, contactName, contactPhone, meetingDay, meetingTime, addDateStamp, googleMapsUrl]);

  // Efecto para guardar la configuración cuando cambia
  useEffect(() => {
    if (userId) {
      saveConfig();
    }
  }, [saveConfig, userId]);

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
        unsubscribe();
      };
    } catch (error) {
      console.error('Error al configurar la consulta a Firestore:', error);
      setAlertMessage('Error al configurar la conexión con la base de datos.');
      setIsLoading(false);
    }
  }, [userId]);

  // Efecto para cargar la configuración
  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadConfig = async () => {

      try {
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          if (userData.config) {
            const config = userData.config;

            // Actualizar los estados
            if (config.congregation !== undefined) {
              setCongregation(config.congregation);
            }
            if (config.contactName !== undefined) {
              setContactName(config.contactName);
            }
            if (config.contactPhone !== undefined) {
              setContactPhone(config.contactPhone);
            }
            if (config.meetingDay !== undefined) {
              setMeetingDay(config.meetingDay);
            }
            if (config.meetingTime !== undefined) {
              setMeetingTime(config.meetingTime);
            }
            if (config.addDateStamp !== undefined) {
              setAddDateStamp(config.addDateStamp);
            }
            if (config.googleMapsUrl !== undefined) {
              setGoogleMapsUrl(config.googleMapsUrl);
            }
          }
        } else {
          
        }
      } catch (error) {
        console.error('❌ Error al cargar la configuración:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [userId]);

  const handleShare = () => {
    const output = shareableOutput;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(output)}`;
    window.open(whatsappLink, '_blank');
  };

  const handleGeneratePdf = async () => {
    if (speakers.length === 0) {
      setAlertMessage('No hay oradores para generar el PDF');
      return;
    }

    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { pdf } = await import('@react-pdf/renderer');
      const fileName = `Conferencias-${congregation ? congregation : ''}.pdf`;

      // Crear el blob del PDF
      const blob = await pdf(
        <ConferencePdf
          speakers={speakers}
          congregation={congregation}
          contactName={contactName}
          contactPhone={contactPhone}
          meetingDay={meetingDay}
          meetingTime={meetingTime}
          googleMapsUrl={googleMapsUrl}
        />
      ).toBlob();

      // Crear una URL para el blob
      const url = URL.createObjectURL(blob);

      // Abrir en una nueva pestaña
      const newWindow = window.open(url, '_blank');

      // Liberar memoria cuando ya no sea necesaria
      if (newWindow) {
        newWindow.onload = () => URL.revokeObjectURL(url);
      } else {
        // Si el navegador bloquea la ventana emergente, forzar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setAlertMessage('PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setAlertMessage('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  const generateJSON = () => {
    // Formatear el día de la reunión para mostrarlo correctamente
    const formattedDay = meetingDay === 'sabado' ? 'Sábado' : 'Domingo';

    // Crear objeto con la información global y la lista de oradores
    const exportData = {
      congregation_name: congregation,
      addDateStamp: addDateStamp,
      google_maps_url: googleMapsUrl,
      contact_name: contactName,
      contact_phone: contactPhone,
      meeting_day: meetingDay,
      meeting_time: meetingTime,
      meeting_schedule: `${formattedDay} - ${meetingTime} hs`,
      speakers: speakers,
      // Incluir metadatos adicionales
      exported_at: new Date().toISOString(),
      version: '1.0'
    };

    const json = JSON.stringify(exportData, null, 2);

    // Crear un enlace de descarga
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conferenciantes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setAlertMessage("¡JSON generado!");
  };

  const processFileUpload = async (data: any) => {
    if (!userId) return;

    try {
      // Determinar si los datos tienen el nuevo formato con metadata global
      const isNewFormat = data.congregation_name !== undefined || data.addDateStamp !== undefined;
      const speakersData = isNewFormat ? data.speakers || [] : data;

      if (!Array.isArray(speakersData)) {
        throw new Error('El formato del archivo no es válido');
      }

      // Actualizar los valores globales si están presentes en el archivo
      if (isNewFormat) {
        if (data.congregation_name !== undefined) {
          setCongregation(data.congregation_name);
        }
        if (data.addDateStamp !== undefined) {
          setAddDateStamp(data.addDateStamp);
        }
        if (data.google_maps_url !== undefined) {
          setGoogleMapsUrl(data.google_maps_url);
        }
        if (data.contact_name !== undefined) {
          setContactName(data.contact_name);
        }
        if (data.contact_phone !== undefined) {
          setContactPhone(data.contact_phone);
        }
        if (data.meeting_day !== undefined) {
          setMeetingDay(data.meeting_day);
        }
        if (data.meeting_time !== undefined) {
          setMeetingTime(data.meeting_time);
        }
      }

      // Eliminar los oradores existentes
      const deletePromises = speakers.map(speaker =>
        deleteDoc(doc(db, getTalksPath(userId), speaker.id))
      );

      await Promise.all(deletePromises);

      // Agregar los nuevos oradores
      const addPromises = speakersData.map((speaker: any) =>
        setDoc(doc(db, getTalksPath(userId), speaker.id), {
          first_name: speaker.first_name,
          family_name: speaker.family_name,
          phone: speaker.phone || '',
          role: speaker.role,
          available: speaker.available !== undefined ? speaker.available : true,
          talks: (speaker.talks || []).map((talk: { id: number; available?: boolean; assigned_date?: string }) => ({
            id: talk.id,
            available: talk.available !== undefined ? talk.available : true,
            assigned_date: talk.assigned_date || ''
          })),
          created_at: speaker.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      await Promise.all(addPromises);
      setAlertMessage('¡Datos cargados correctamente!');
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      setAlertMessage(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setShowImportDialog(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Verificar si es el nuevo formato con metadata global
        const isNewFormat = data.congregation_name !== undefined || data.addDateStamp !== undefined;
        const speakersData = isNewFormat ? data.speakers || [] : data;

        if (!Array.isArray(speakersData)) {
          throw new Error('El formato del archivo no es válido');
        }

        // Actualizar los valores globales si están presentes en el archivo
        if (isNewFormat) {
          // Configuración general
          if (data.congregation_name !== undefined) setCongregation(data.congregation_name);
          if (data.addDateStamp !== undefined) setAddDateStamp(data.addDateStamp);
          if (data.meeting_day !== undefined) setMeetingDay(data.meeting_day);
          if (data.meeting_time !== undefined) setMeetingTime(data.meeting_time);
          if (data.google_maps_url !== undefined) setGoogleMapsUrl(data.google_maps_url);

          // Datos de contacto
          if (data.contact_name !== undefined) setContactName(data.contact_name);
          if (data.contact_phone !== undefined) setContactPhone(data.contact_phone);
        }

        setImportData(speakersData);
        setShowImportDialog(true);
        e.target.value = '';
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        setAlertMessage('Error al procesar el archivo. Asegúrate de que sea un JSON válido.');
      }
    };
    reader.onerror = () => {
      setAlertMessage('Error al leer el archivo');
    };

    reader.readAsText(file);
  };

  // Función para actualizar un conferenciante
  const updateSpeaker = useCallback(async (speakerId: string, updates: Partial<Speaker>) => {
    if (!userId) return;

    const speakerRef = doc(db, getTalksPath(userId), speakerId);
    try {
      await setDoc(speakerRef, { ...updates, updated_at: new Date().toISOString() }, { merge: true });
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    let output = "=== Conferenciantes " + (congregation ? `de ${congregation.toUpperCase()} ` : "") + "===\n\n";

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

      // Mostrar solo oradores disponibles
      const availableSpeakers = sortedSpeakers.filter(speaker => speaker.available);

      availableSpeakers.forEach(speaker => {
        // Filtrar solo los discursos disponibles del orador
        const availableTalks = speaker.talks.filter(talk => talk.available);
        if (availableTalks.length === 0) return; // Saltar si no hay discursos disponibles
        // Agregar nombre y teléfono
        output += `\n${speaker.family_name}, ${speaker.first_name}`;
        if (speaker.phone) {
          output += ` ( +54 ${speaker.phone} )`;
        }
        output += ":\n";

        // Agregar discursos (ya filtrados como disponibles)
        availableTalks.forEach(talk => {
          const talkInfo = MASTER_TALKS.find(t => t.id === talk.id);
          output += `  - ${talk.id} - ${talkInfo?.title || 'Título no encontrado'}\n`;
        });
      });

      output += "\n";
    });


    contactName && (output += `\nContacto: ${contactName}`);
    contactPhone && (output += `\nTeléfono: ${contactPhone}`);

    output += "\n";

    /* Horario */
    (meetingDay || meetingTime) && (output += "\nHorario\n");
    meetingDay && (output += `Reuniones: ${meetingDay === 'sabado' ? 'Sábado' : 'Domingo'}`);
    meetingTime && (output += ` - ${meetingTime}`);
    output += "\n";


    /* Google Maps */
    (googleMapsUrl) && (output += "\nGoogle Maps\n");
    googleMapsUrl && (output += `${googleMapsUrl}`);

    output += "\n";

    /* Actualizado */
    (addDateStamp) && (output += "\nActualizado\n");
    addDateStamp && (output += `${new Date().toLocaleString()}`);

    return output;
  }, [speakers, isLoading, addDateStamp, congregation, meetingDay, meetingTime, googleMapsUrl, contactName, contactPhone]);

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
        <header className="mb-4 fixed top-0 left-0 pl-10 right-0 z-50 bg-blue-600 text-white p-4 shadow-md">
          <h1 className="md:text-3xl text-xl font-bold">Gestor de Conferencias</h1>
          <p className="text-gray-200 hidden md:block">Gestioná los conferenciantes y sus discursos de tu congregación para organizarlos y compartirlos fácilmente.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-20">
          {/* Panel de gestión */}
          <div className="lg:col-span-1 space-y-4">
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
                      value={newSpeakerPhone}
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
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={!newSpeakerName.first || !newSpeakerName.family}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Conferenciante
                </Button>
              </form>
            </section>

            {/* Sección de configuración colapsable */}
            <div className="mb-6 text-md text-gray-600">
              <Button
                variant="secondary"
                onClick={() => setShowConfig(!showConfig)}
                className="justify-start ml-6  bg-transparent focus:ring-0 border border-dashed border-blue-200"
              >
                <span className="flex items-center text-gray-600 hover:text-gray-100">
                  <span className="mr-2">⚙️</span>
                  {showConfig ? 'Ocultar opciones' : 'Mostrar más opciones...'}
                </span>
              </Button>

              {showConfig && (
                <div className="mt-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fila 1 - Columna 1: Congregación */}
                    <div>
                      <label htmlFor="congregation" className="block text-sm font-medium text-gray-700 mb-1">
                        Congregación
                      </label>
                      <input
                        type="text"
                        id="congregation"
                        value={congregation}
                        onChange={(e) => setCongregation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>

                    {/* Fila 1 - Columna 2: Checkbox de fecha */}
                    <div className="flex items-end">
                      <div className="flex items-center h-[42px] border border-gray-300 rounded-md px-3 bg-gray-50 w-full">
                        <label htmlFor="addDateStamp" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            id="addDateStamp"
                            checked={addDateStamp}
                            onChange={(e) => setAddDateStamp(e.target.checked)}
                            className="h-4 w-4 text-blue-600 mr-2"
                          />
                          Agregar fecha al final
                        </label>
                      </div>
                    </div>

                    {/* Fila 2 - Columna 1: Día de reunión */}
                    <div>
                      <label htmlFor="meetingDay" className="block text-sm font-medium text-gray-700 mb-1">
                        Día de reunión de fin de semana
                      </label>
                      <select
                        id="meetingDay"
                        value={meetingDay}
                        onChange={(e) => setMeetingDay(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      >
                        <option value="sabado">Sábado</option>
                        <option value="domingo">Domingo</option>
                      </select>
                    </div>
                    {/* Fila 2 - Columna 2: Hora de reunión */}
                    <div>
                      <label htmlFor="meetingTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de reunión de fin de semana
                      </label>
                      <input
                        type="time"
                        id="meetingTime"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>

                    {/* Fila 3 - Columna 1: Nombre de contacto */}
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del contacto de la congregación
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    {/* Fila 3 - Columna 2: Teléfono de contacto */}
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono del contacto de la congregación
                      </label>
                      <input
                        type="text"
                        id="contactPhone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder="Ej: +54 9 11 1234-5678"
                      />
                    </div>

                    {/* Fila 4 - Columna 1 y 2: URL de Google Maps */}
                    <div>
                      <label htmlFor="googleMapsUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        URL de Google Maps
                      </label>
                      <input
                        type="text"
                        id="googleMapsUrl"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder="Ej: https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de conferenciantes */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-600">Conferenciantes</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{speakers.length} registrados</span>
                </div>
              </div>

              {speakers.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">
                  No hay conferenciantes registrados. Agrega uno para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  {speakers.map(speaker => (
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
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Este es el formato que se compartirá con los demás.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">
                    {shareableOutput}
                  </pre>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* Fila 1 */}
                <Button
                  onClick={() => {
                    handleShare();
                  }}
                  variant="success"
                  className="w-full"
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>

                <Button
                  onClick={speakers.length === 0 ? () => setAlertMessage("No hay conferenciantes registrados. Agrega uno para comenzar.") : handleGeneratePdf}
                  variant="info"
                  className="w-full"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>

                {/* disabled button */}
                {/* <Button
                  onClick={() => {
                    
                  }}
                  variant="info"
                  className="w-full"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button> */}

                {/* Fila 2 */}
                <Button
                  onClick={generateJSON}
                  variant="warning"
                  className="w-full"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  Exportar JSON
                </Button>

                <div>
                  <input
                    type="file"
                    id="json-upload"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    as="label"
                    htmlFor="json-upload"
                    variant="primary"
                    className="w-full cursor-pointer"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Importar JSON
                  </Button>
                </div>
              </div>
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

      <ConfirmationDialog
        isOpen={showImportDialog}
        title="Confirmar importación"
        message="¿Estás seguro de que deseas cargar estos datos? Se sobrescribirán los datos actuales."
        onConfirm={() => processFileUpload(importData)}
        onCancel={() => setShowImportDialog(false)}
        confirmText="Sí, importar"
        cancelText="Cancelar"
      />

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
