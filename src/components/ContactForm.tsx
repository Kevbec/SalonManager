import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Construire l'URL mailto avec les paramètres
    const mailtoUrl = `mailto:beckersk9@gmail.com?subject=Contact depuis SalonManager - ${formData.name}&body=${encodeURIComponent(
      `Nom: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    // Ouvrir le client mail par défaut
    window.location.href = mailtoUrl;
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
    setStatus('success');

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Nous contacter</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full flex justify-center items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4 mr-2" />
          {status === 'sending' ? 'Envoi...' : 'Envoyer'}
        </button>

        {status === 'success' && (
          <div className="text-center text-sm text-green-600">
            Votre message a été envoyé avec succès !
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-sm text-red-600">
            Une erreur est survenue. Veuillez réessayer.
          </div>
        )}
      </form>
    </div>
  );
}