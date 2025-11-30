import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { Speaker } from '@/types';
import { MASTER_TALKS } from '@/lib/constants';

interface ConferencePdfProps {
  speakers: Speaker[];
  congregation?: string;
  contactName?: string;
  contactPhone?: string;
  meetingDay?: string;
  meetingTime?: string;
  googleMapsUrl?: string;
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff', // Fondo blanco por defecto
    lineHeight: 1.4
  },
  speakerContainer: {
    marginBottom: 10,
    paddingBottom: 8,
    paddingTop: 8,
    marginLeft: 10,
  },
  speakerInfoLine: {
    fontSize: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 4
  },
  speakerName: {
    fontWeight: 'bold',
  },
  speakerRole: {
    color: '#666',
    fontStyle: 'italic'
  },
  speakerPhone: {
    color: '#1a56db',
    textDecoration: 'none',
    fontStyle: 'italic'
  },
  talksContainer: {
    marginTop: 4,
    paddingLeft: 10,
    borderLeft: '2px solid #e0e0e0'
  },
  talk: {
    fontSize: 10,
    marginBottom: 2
  },
  break: {
    textAlign: 'center',
    margin: '15px 0',
    color: '#999'
  },
  breakText: {
    fontSize: 14,
    letterSpacing: 5
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
    zIndex: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 12,
    marginBottom: 5,
    marginTop: 15,
  },
  infoRole: {
    fontSize: 12,
    backgroundColor: '#003693ff',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15,
    padding: '5px 15px',
    borderRadius: 5,
  },
  contact: {
    marginTop: 10,
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

  const getTalkNameById = (talkId: string) => {
    const talk = MASTER_TALKS.find((talk) => talk.id === Number(talkId));
    return talk ? talk.title : talkId;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image
          src="./Conferenciantes.png"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '99.5%',
            height: '99.5%',
            zIndex: -1,
            opacity: 0.1
          }}
        />

        <View style={styles.container}>
          <Text style={styles.title}>Conferenciantes {congregation ? `de Congregación ${congregation}` : ''}</Text>

          {speakers.length > 0 && (
            <>
              {speakers.some(speaker => speaker.role === 'Anciano') && (
                <Text style={[styles.info, styles.infoRole]}>Ancianos</Text>
              )}
              {/* Ancianos */}
              {speakers
                .filter(speaker => speaker.available !== false && speaker.role === 'Anciano' && speaker.talks.some(talk => talk.available !== false))
                .map((speaker) => (
                  <View key={speaker.id} style={styles.speakerContainer}>
                    <View style={styles.speakerInfoLine}>
                      <>
                        <Text style={styles.speakerName}>
                          {speaker.first_name} {speaker.family_name}
                        </Text>
                        <Text style={styles.speakerRole}>
                          ({speaker.role})
                        </Text>
                        {speaker.phone && (
                          <Text style={styles.speakerPhone}>
                            +54 {speaker.phone}
                          </Text>
                        )}
                      </>
                    </View>

                    {speaker.talks?.filter(talk => talk.available !== false).length > 0 && (
                      <View style={styles.talksContainer}>
                        {speaker.talks
                          .filter(talk => talk.available !== false)
                          .map((talk) => (
                            <Text style={styles.talk} key={talk.id}>
                              {talk.id} - {getTalkNameById(talk.id.toString())}
                            </Text>
                          ))
                        }
                      </View>
                    )}
                  </View>
                ))}

              {speakers.some(speaker => speaker.role === 'Siervo Ministerial') && (
                <Text style={[styles.info, styles.infoRole]}>Ministeriales</Text>
              )}

              {/* Ministeriales */}
              {speakers
                .filter(speaker => speaker.available !== false && speaker.role === 'Siervo Ministerial' && speaker.talks.some(talk => talk.available !== false))
                .map((speaker) => (
                  <View key={speaker.id} style={styles.speakerContainer}>
                    <View style={styles.speakerInfoLine}>
                      <Text style={styles.speakerName}>
                        {speaker.first_name} {speaker.family_name}
                      </Text>
                      <Text style={styles.speakerRole}>
                        ({speaker.role})
                      </Text>
                      {speaker.phone && (
                        <Text style={styles.speakerPhone}>
                          +54 {speaker.phone}
                        </Text>
                      )}
                    </View>

                    {speaker.talks?.filter(talk => talk.available !== false).length > 0 && (
                      <View style={styles.talksContainer}>
                        {speaker.talks
                          .filter(talk => talk.available !== false)
                          .map((talk) => (
                            <Text style={styles.talk} key={talk.id}>
                              {talk.id} - {getTalkNameById(talk.id.toString())}
                            </Text>
                          ))
                        }
                      </View>
                    )}
                  </View>
                ))}
            </>
          )}

          {(meetingDay || meetingTime) && (
            <Text style={styles.info}>
              Reuniones: {formattedDay} {meetingTime && `- ${meetingTime} hs`}
            </Text>
          )}

          {googleMapsUrl && (
            <View style={styles.info}>
              <Text style={styles.info}>
                bicación del Salón del Reino en Google Maps:
              </Text>
              <Text style={styles.info}>
                {googleMapsUrl}
              </Text>
            </View>
          )}

          {(contactName || contactPhone) && (
            <View style={styles.contact}>
              <Text>Contacto: {contactName || ''}</Text>
              {contactPhone && <Text>Teléfono: {contactPhone}</Text>}
            </View>
          )}

          {currentDate && (
            <Text style={styles.info}>Actualizado: {currentDate}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ConferencePdf;
