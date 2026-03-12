'use client';

import Link from 'next/link';
import { UserGroupIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 tracking-tight mb-4">
          Speaker Planner
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          ¿Qué herramienta te gustaría utilizar hoy?
        </p>
      </div>

      {/* Tarjetas de Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">

        {/* Tarjeta 1: Conferenciantes */}
        <Link href="/conferenciantes-locales" className="group">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="bg-blue-600 p-6 flex justify-center items-center group-hover:bg-blue-700 transition-colors">
              <UserGroupIcon className="w-16 h-16 text-white opacity-90" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                Gestor de Conferenciantes
              </h2>
              <p className="text-gray-600 mb-4 flex-grow">
                Organiza a los oradores locales, asigna discursos, verifica disponibilidades y genera reportes rápidamente en PDF o WhatsApp.
              </p>
              <div className="inline-flex items-center text-blue-600 font-semibold mt-auto">
                Ingresar al Gestor
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Tarjeta 2: Calendario */}
        <Link href="/calendario-congregacion" className="group">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="bg-emerald-600 p-6 flex justify-center items-center group-hover:bg-emerald-700 transition-colors">
              <CalendarDaysIcon className="w-16 h-16 text-white opacity-90" />
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                Calendario de Congregación
              </h2>
              <p className="text-gray-600 mb-4 flex-grow">
                Planifica las reuniones de fin de semana, visualiza la programación mensual y gestiona las asignaciones de manera centralizada.
              </p>
              <div className="inline-flex items-center text-emerald-600 font-semibold mt-auto">
                Abrir Calendario
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
