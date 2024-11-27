import React from 'react';
import { X } from 'lucide-react';

interface ContactPopupProps {
  onClose: () => void;
}

export function ContactPopup({ onClose }: ContactPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Contactez-nous</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Pour souscrire à ce forfait ou obtenir plus d'informations, contactez-nous directement :
        </p>

        <div className="space-y-4">
          <a
            href="mailto:beckersk9@gmail.com"
            className="w-full flex justify-center items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Nous contacter par email
          </a>
        </div>
      </div>
    </div>
  );
}