import { useState, useEffect } from 'react';
import { SITE_KEY, SECRET_KEY, ENDPOINT } from "astro:env/client";

export default function ContactForm({ addressee }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // Cleanup
        return () => {
            console.log('Limpiando recursos');
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            // Obtener token de reCAPTCHA
            const token = await grecaptcha.execute(SITE_KEY, { action: 'submit' });

            const data = {
                secret_key: SECRET_KEY,
                addressee: addressee,
                asunto: 'Nuevo mensaje desde el formulario de contacto',
                token: token,
                ...formData
            };

            // Enviar formulario
            const response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            // Éxito
            setMessage({
                text: '¡Mensaje enviado correctamente! Te responderemos pronto.',
                type: 'success'
            });

            // Limpiar formulario
            setFormData({
                name: '',
                phone: '',
                email: '',
                message: ''
            });
        } catch (error) {
            // Error
            let errorMessage = 'Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente.';

            if (error.errors) {
                const formErrors = error.errors;
                for (let field in formErrors) {
                    if (formErrors.hasOwnProperty(field)) {
                        errorMessage = formErrors[field];
                        break;
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessage({
                text: errorMessage,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <section className="py-8">
            <article className="border-2 border-secondary rounded-3xl p-8">
                <h3 className="text-primary text-outline-2 font-atma font-bold text-3xl md:text-4xl text-center mb-8">
                    Envíanos un mensaje
                </h3>

                <form 
                    className="space-y-6"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-white font-semibold text-lg mb-2">
                                Tu nombre
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Tu nombre"
                                className="w-full px-4 py-3 rounded-xl border-2 border-white/70 bg-transparent text-white placeholder-white/50 focus:border-secondary focus:outline-none transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-white font-semibold text-lg mb-2">
                                Tu E-mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Tu E-mail"
                                className="w-full px-4 py-3 rounded-xl border-2 border-white/70 bg-transparent text-white placeholder-white/50 focus:border-secondary focus:outline-none transition-colors duration-200"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-white font-semibold text-lg mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Tu teléfono"
                            className="w-full px-4 py-3 rounded-xl border-2 border-white/70 bg-transparent text-white placeholder-white/50 focus:border-secondary focus:outline-none transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-white font-semibold text-lg mb-2">
                            Mensaje
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="6"
                            placeholder="Escribe tu mensaje aquí..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-white/70 bg-transparent text-white placeholder-white/50 focus:border-secondary focus:outline-none transition-colors duration-200 resize-none"
                        ></textarea>
                    </div>
                    {message.text && (
                        <div className={`p-4 rounded-xl text-center font-semibold border-2 ${
                            message.type === 'success' 
                                ? 'bg-green-500/20 border-green-500 text-green-500' 
                                : 'bg-red-500/20 border-red-500 text-red-500'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer bg-secondary hover:bg-secondary/90 text-tertiary font-atma font-bold text-xl md:text-2xl px-12 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                        </button>
                    </div>
                    <p className="text-white/70 text-sm text-center">
                        Este sitio está protegido por reCAPTCHA y se aplican la 
                        <a href="https://policies.google.com/privacy" target="_blank" className="text-secondary hover:underline">Política de Privacidad</a> y los 
                        <a href="https://policies.google.com/terms" target="_blank" className="text-secondary hover:underline">Términos de Servicio</a> de Google.
                    </p>
                </form>
            </article>
        </section>
    )
}
