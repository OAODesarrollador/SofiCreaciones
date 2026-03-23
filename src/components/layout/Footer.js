import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>

                <div className={styles.column}>
                    <h3 className={`${styles.title} texto-sofi`} style={{ fontSize: '2rem' }}>Sofi Creaciones</h3>
                    <p className={styles.text}>
                        La mejor selección de disfraces, accesorios y uniformes profesionales.<br />
                        Comprá rápido y seguro desde tu casa.
                    </p>
                    <br />
                    <h4 className={styles.title} style={{ fontSize: '1rem' }}>Horarios</h4>
                    <p className={styles.text}>Lun a Sab: 09:00 - 20:00</p>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.title}>Contacto</h3>
                    <p className={styles.text}>📍 Barrio Nueva Formosa - Sede Central </p>
                    <p className={styles.text}>📞 370-4XXXXXX</p>
                    <p className={styles.text}>📧 SofiCreaciones@gmail.com</p>
                </div>

                <div className={styles.column} style={{ flex: 1.5 }}>
                    <h3 className={styles.title}>Dónde Estamos</h3>
                    <div className={styles.mapContainer}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d858.8399437893247!2d-58.24121446483225!3d-26.20125473571083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1ses!2sus!4v1774292627143!5m2!1ses!2sus" 
                            width="600" 
                            height="450" 
                            style={{ border: 0 }} 
                            allowFullScreen
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            
                        ></iframe>
                    </div>
                </div>

            </div>
            <div className={styles.copyright}>
                © {new Date().getFullYear()} <span className="texto-sofi" style={{ fontSize: '1.2rem' }}>Sofi Creaciones</span>. Todos los derechos reservados.
            </div>
        </footer>
    );
}
