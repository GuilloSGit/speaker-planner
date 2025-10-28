# 🎤 Planificador de Conferencias

<div align="center">
  <p>Una aplicación web para gestionar oradores y sus discursos de manera eficiente.</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
</div>

## 🌟 Características Principales

- **Gestión de Oradores** - Añade, edita y elimina oradores fácilmente
- **Asignación de Discursos** - Asigna discursos a los oradores con un solo clic
- **Exportación/Importación** - Guarda y carga datos en formato JSON
- **Compartir** - Copia la lista de oradores y discursos para compartir
- **Responsive** - Funciona perfectamente en dispositivos móviles y de escritorio

## 🚀 Cómo Usar

### Requisitos Previos

- Node.js 16.8 o superior
- Cuenta de Firebase (para la base de datos)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/speaker-planner.git
   cd speaker-planner
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Capturas de Pantalla

![Vista de lista de oradores](/screenshots/speakers-list.png)
*Lista de oradores con sus discursos asignados*

![Formulario de orador](/screenshots/speaker-form.png)
*Formulario para agregar un nuevo orador*

## 🛠 Tecnologías Utilizadas

- **Frontend**: Next.js 13+ con App Router
- **Estilos**: Tailwind CSS
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Tipado**: TypeScript
- **Despliegue**: Vercel

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

---

<div align="center">
  Hecho con ❤️ por [Guillermo Andrada](https://ga-software.wuaze.com)
</div>
