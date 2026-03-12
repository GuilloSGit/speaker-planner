'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, UserPlusIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { format, addWeeks, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import { Meeting, SpecialEventType } from '@/types';

// Cargamos el mapa asíncronamente para evitar problemas de SSR con Leaflet
const LocationPickerMap = dynamic(
    () => import('@/components/LocationPickerMap'),
    { ssr: false, loading: () => <div className="h-48 w-full bg-gray-100 rounded-md animate-pulse"></div> }
);

// Helper function to generate STUB_DATES based on selected day ('sabado' or 'domingo')
const generateDates = (dayToSelect: 'sabado' | 'domingo') => {
    return Array.from({ length: 53 }).map((_, i) => {
        // Generar fines de semana para el próximo año (53 semanas)
        const base = startOfWeek(new Date(), { weekStartsOn: 1 });
        // Sábado = 5 (desde Lunes=0), Domingo = 6
        const offset = dayToSelect === 'sabado' ? 5 : 6;
        return addDays(addWeeks(base, i), offset);
    });
};

export default function CalendarioCongregacion() {
    // Default settings (simulating data fetched from Gestor)
    const [meetingDay, setMeetingDay] = useState<'sabado' | 'domingo'>('sabado');
    const [meetingTime, setMeetingTime] = useState('18:00');

    // Config de 'Congregación Ajena' para Columna 3 (independiente de la nuestra)
    const [otherMeetingDay, setOtherMeetingDay] = useState<'sabado' | 'domingo'>('sabado');
    const [otherMeetingTime, setOtherMeetingTime] = useState('18:00');

    // Fechas dinámicas calculadas basadas en meetingDay
    const memoizedDates = React.useMemo(() => generateDates(meetingDay), [meetingDay]);

    // Al cambiar la lista de fechas, nos aseguramos que selectDate sintonice con el nuevo día 
    // del mismo fin de semana (para evitar que se pierda la selección actual)
    const [selectedDate, setSelectedDate] = useState<Date>(memoizedDates[0]);

    // Efecto para sintonizar el selectedDate si cambia el meetingDay
    React.useEffect(() => {
        const offset = meetingDay === 'sabado' ? -1 : 1;
        const newD = addDays(selectedDate, offset);
        setSelectedDate(newD);
    }, [meetingDay]);

    // Simulate current meeting state
    const [currentMeeting, setCurrentMeeting] = useState<Partial<Meeting>>({
        type: 'regular',
    });

    // Config de arreglo para el mes actual/seleccionado
    const [arregloCongregacion, setArregloCongregacion] = useState('');

    // Estados para el mapa (salida)
    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLng, setSelectedLng] = useState<number | null>(null);

    return (
        <div className="h-screen max-h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-emerald-600 text-white p-4 shadow-md h-16 sm:h-20 flex items-center shrink-0 z-50">
                <div className='w-full max-w-7xl mx-auto flex justify-between items-center'>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 text-white hover:text-emerald-100 hover:bg-emerald-700 rounded-full transition-colors">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6" />
                                Calendario
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Layout Principal: 3 Columnas - Dashboard Model */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">

                {/* Columna 1: Selector de Fechas */}
                <div className="w-full lg:w-1/4 xl:w-1/5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-0 overflow-hidden shrink-0 lg:shrink">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            Fechas ({meetingDay === 'sabado' ? 'Sábados' : 'Domingos'})
                        </h2>
                    </div>
                    {/* El overflow-y-auto es CRUCIAL para que no se estire hacia abajo */}
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 min-h-0">
                        <div className="flex flex-col gap-2">
                            {memoizedDates.map((date, i) => {
                                const isSelected = isSameDay(date, selectedDate);
                                const showYearDivider = i > 0 && date.getFullYear() !== memoizedDates[i - 1].getFullYear();

                                return (
                                    <React.Fragment key={i}>
                                        {showYearDivider && (
                                            <div className="flex items-center gap-2 my-2">
                                                <div className="flex-1 h-px bg-emerald-200"></div>
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                                    {date.getFullYear()}
                                                </span>
                                                <div className="flex-1 h-px bg-emerald-200"></div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setSelectedDate(date)}
                                            className={`p-3 rounded-lg text-left transition-all flex items-center justify-between border ${isSelected
                                                ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500 shadow-sm'
                                                : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div>
                                                <div className={`text-xs uppercase font-semibold ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                    {format(date, 'MMM', { locale: es })}
                                                </div>
                                                <div className={`text-2xl font-bold ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                                                    {format(date, 'dd')}
                                                </div>
                                            </div>
                                            {/* Status indicators placeholder */}
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            </div>
                                        </button>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Área Principal (Columnas 2 y 3) compartiendo header dinámico */}
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 h-full min-h-0 overflow-hidden">
                    {/* Header compartido para la fecha seleccionada */}
                    <div className="p-4 border-b border-gray-200 bg-emerald-50/30 flex justify-between items-center shrink-0">
                        <div></div>
                        {/* Control de Tipo de Evento (Normal vs Especial) */}
                        <div>
                            <select
                                value={currentMeeting.type || 'regular'}
                                onChange={(e) => setCurrentMeeting({ ...currentMeeting, type: e.target.value as any })}
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="regular">Reunión Normal</option>
                                <option value="special">Evento Especial</option>
                            </select>
                        </div>
                    </div>

                    {currentMeeting.type === 'special' ? (
                        /* Vista de Evento Especial (Bloquea las columnas) */
                        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
                            <div className="max-w-md w-full text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Fecha Reservada</h3>

                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={currentMeeting.specialEvent || ''}
                                    onChange={(e) => setCurrentMeeting({ ...currentMeeting, specialEvent: e.target.value as SpecialEventType })}
                                >
                                    <option value="" disabled>Seleccionar tipo de evento...</option>
                                    <option value="Visita del Superintendente">Visita del Superintendente</option>
                                    <option value="Visita de enviado de la Central Mundial">Visita de enviado de la Central Mundial</option>
                                    <option value="Asamblea de Circuito">Asamblea de Circuito</option>
                                    <option value="Asamblea Regional">Asamblea Regional</option>
                                    <option value="Conferencia Especial">Conferencia Especial</option>
                                    <option value="Conmemoración">Conmemoración</option>
                                    <option value="Otra fecha especial">Otra fecha especial</option>
                                </select>

                                <p className="text-sm text-gray-500 mt-2">
                                    En este fin de semana no se reciben ni se envían conferenciantes locales debido a este evento.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Columnas 2 y 3 (Recibimos / Enviamos) */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Header Auxiliar de Arreglo */}
                            <div className="bg-gray-100/50 p-3 border-b border-gray-200 flex items-center justify-between gap-3 shrink-0">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">🤝 Arreglo de congregación:</span>
                                    <input
                                        type="text"
                                        placeholder="Tipear nombre..."
                                        value={arregloCongregacion}
                                        onChange={(e) => setArregloCongregacion(e.target.value)}
                                        className="w-full max-w-sm px-3 py-1.5 text-gray-700 border border-gray-300 rounded bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 overflow-hidden">

                                {/* Columna 2: Recibimos */}
                                <div className="flex-1 flex flex-col overflow-y-auto w-full">
                                    <div className="p-4 bg-blue-50/50 border-b border-gray-100 sticky top-0 z-10 shrink-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-semibold text-blue-900">Nuestra Reunión</h3>
                                            </div>
                                        </div>

                                        {/* Ajustes locales para Nuestra Reunión */}
                                        <div className="flex gap-2 items-center bg-blue-100/50 p-2 rounded-lg border border-blue-200/50">
                                            <select
                                                value={meetingDay}
                                                onChange={(e) => setMeetingDay(e.target.value as 'sabado' | 'domingo')}
                                                className="w-1/2 p-1 border border-blue-300 rounded text-xs text-blue-800 bg-white focus:ring-blue-500"
                                            >
                                                <option value="sabado">Sábado</option>
                                                <option value="domingo">Domingo</option>
                                            </select>
                                            <input
                                                type="time"
                                                value={meetingTime}
                                                onChange={(e) => setMeetingTime(e.target.value)}
                                                className="w-1/2 p-1 border border-blue-300 rounded text-xs text-blue-800 bg-white focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="bg-white border text-left border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-800 border-b pb-2">Registrar Visitante</h4>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                                                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 text-gray-800" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                                                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 text-gray-800" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                                    <input type="tel" className="w-full p-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 text-gray-800" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Congregación</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={arregloCongregacion}
                                                        className="w-full p-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 text-gray-800 bg-gray-50 text-gray-500"
                                                        placeholder={arregloCongregacion}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nº Discurso</label>
                                                    <input type="number" className="w-full p-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 text-gray-800" />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nº Canción</label>
                                                    <input type="number" className="w-full p-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 text-gray-800" />
                                                </div>
                                            </div>

                                            <button className="w-full py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                                                <UserPlusIcon className="w-4 h-4" /> Asignar Orador
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna 3: Enviamos */}
                                <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50/50 hover:bg-white transition-colors w-full">
                                    <div className="p-4 bg-orange-50/50 border-b border-gray-100 sticky top-0 z-10 shrink-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-orange-600" />
                                            <h3 className="font-semibold text-orange-900">Congregación {arregloCongregacion ? arregloCongregacion : 'que visitamos'}</h3>
                                        </div>

                                        {/* Ajustes locales para Congregación Ajena */}
                                        <div className="flex gap-2 items-center bg-orange-100/50 p-2 rounded-lg border border-orange-200/50">
                                            <select
                                                value={otherMeetingDay}
                                                onChange={(e) => setOtherMeetingDay(e.target.value as 'sabado' | 'domingo')}
                                                className="w-1/2 p-1 border border-orange-300 rounded text-xs text-orange-800 bg-white focus:ring-orange-500"
                                            >
                                                <option value="sabado">Sábado</option>
                                                <option value="domingo">Domingo</option>
                                            </select>
                                            <input
                                                type="time"
                                                value={otherMeetingTime}
                                                onChange={(e) => setOtherMeetingTime(e.target.value)}
                                                className="w-1/2 p-1 border border-orange-300 rounded text-xs text-orange-800 bg-white focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="bg-white border text-left border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-800 border-b pb-2">Programar Salida</h4>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                                                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                                                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                                                    <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                                        <option>Anciano</option>
                                                        <option>Siervo Ministerial</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nº Discurso</label>
                                                    <input type="number" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Congregación Destino</label>
                                                <input
                                                    type="text"
                                                    defaultValue={arregloCongregacion}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
                                                    placeholder="Tipeá hacia dónde va..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Horario (Allá)</label>
                                                    <input type="time" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                                    <input type="tel" className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación (Maps URL u opcional)</label>
                                                <input type="url" className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2" placeholder="https://maps..." />

                                                <div className="mt-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                                        <span>Punto en el Mapa</span>
                                                        <span className="text-gray-400 font-normal">Opcional</span>
                                                    </label>
                                                    <LocationPickerMap
                                                        onLocationSelect={(lat, lng) => {
                                                            setSelectedLat(lat);
                                                            setSelectedLng(lng);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <button className="w-full py-2 mt-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                                                <UserPlusIcon className="w-4 h-4" /> Registrar Salida
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
