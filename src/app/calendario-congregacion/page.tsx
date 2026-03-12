'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CalendarioCongregacion() {
    return (
        <div className="min-h-screen bg-gray-50 flexflex-col p-4 md:p-8">
            <div className="max-w-7xl mx-auto mt-2 mx-6">
                <header className="mb-4 fixed top-0 left-0 pl-10 right-0 z-50 bg-emerald-600 text-white p-4 shadow-md">
                    <div className='max-w-[900] px-5'>
                        <Link href="/" className="absolute top-4 left-4 p-2 text-white hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </Link>
                        <h1 className="md:text-3xl max-w-md text-xl font-bold">Calendario de Congregación</h1>
                        <p className="text-gray-200 hidden md:block">Organiza las reuniones de la congregación y gestiona las asignaciones de manera centralizada.</p>
                    </div>
                </header>

                {/* Contenido en construcción */}
                <div className="mt-20 bg-white p-12 rounded-xl shadow-md border border-gray-200 text-center flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="text-6xl mb-6">📅</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sección en Construcción</h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Estamos preparando el nuevo módulo de calendario para organizar las reuniones de la congregación.
                    </p>
                    <Link href="/">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Volver al Inicio
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
