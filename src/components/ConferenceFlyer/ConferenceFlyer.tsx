import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { Speaker } from '@/types';

// Usar require para la imagen de fondo
const backgroundImage = require('../../../public/Conferenciantes.svg');

interface ConferencePdfProps {
  speakers: Speaker[];
  congregation: string;
  contactName: string;
  contactPhone: string;
  meetingDay?: string;
  meetingTime?: string;
  googleMapsUrl?: string;
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  container: {
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  info: {
    marginBottom: 10,
    fontSize: 12,
  },
  contact: {
    marginTop: 20,
    fontSize: 12,
  }
});

const ConferencePdf: React.FC<ConferencePdfProps> = ({ 
  speakers, 
  congregation, 
  contactName, 
  contactPhone, 
  meetingDay, 
  meetingTime, 
  googleMapsUrl 
}) => {
  const formattedDay = meetingDay === 'sabado' ? 'Sábados' : 'Domingos';
  const currentDate = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fondo */}
        <Image 
          src={backgroundImage}
          style={styles.backgroundImage}
        />
        
        {/* Contenido */}
        <View style={styles.container}>
          <Text style={styles.title}>Arreglos de Conferencias</Text>
          
          <Text style={styles.info}>Congregación: {congregation || 'No especificada'}</Text>
          
          {(meetingDay || meetingTime) && (
            <Text style={styles.info}>
              Reuniones: {formattedDay} {meetingTime && `- ${meetingTime} hs`}
            </Text>
          )}
          
          {googleMapsUrl && (
            <Text style={styles.info}>
              Ubicación: {googleMapsUrl}
            </Text>
          )}
          
          <Text style={styles.info}>Actualizado: {currentDate}</Text>
          
          {(contactName || contactPhone) && (
            <View style={styles.contact}>
              <Text>Contacto: {contactName || ''}</Text>
              {contactPhone && <Text>Teléfono: {contactPhone}</Text>}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ConferencePdf;
