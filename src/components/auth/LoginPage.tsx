import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  Check, 
  Star, 
  Users, 
  Building2, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ContactForm } from '../ContactForm';
import { ContactPopup } from '../ContactPopup';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showContactPopup, setShowContactPopup] = useState(false);
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
    }
  };

  const stats = [
    { icon: Users, value: '10,000+', label: 'Clients gérés' },
    { icon: Building2, value: '500+', label: 'Salons actifs' },
    { icon: Calendar, value: '1M+', label: 'Rendez-vous planifiés' },
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Propriétaire de Salon',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=250&h=250&fit=crop',
      content: 'SalonManager a révolutionné la gestion de mon salon. Je gagne un temps précieux chaque jour.',
      rating: 5
    },
    {
      name: 'Thomas Martin',
      role: 'Coiffeur Indépendant',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&fit=crop',
      content: 'Une interface intuitive et des fonctionnalités qui répondent parfaitement à mes besoins.',
      rating: 5
    },
    {
      name: 'Sophie Laurent',
      role: 'Gérante Multi-Salons',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&h=250&fit=crop',
      content: 'Excellent pour gérer plusieurs établissements. Le support client est exceptionnel.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Gratuit",
      price: "0",
      period: "pour toujours",
      features: [
        "Jusqu'à 50 clients",
        "Gestion des prestations basique",
        "Tableau de bord simple",
        "Support par email"
      ],
      highlighted: false
    },
    {
      name: "Essentiel",
      price: "15",
      period: "par mois",
      features: [
        "Clients illimités",
        "Gestion avancée des prestations",
        "Tableau de bord détaillé",
        "Support prioritaire",
        "Statistiques avancées"
      ],
      highlighted: true
    },
    {
      name: "Premium",
      price: "75",
      period: "par mois",
      features: [
        "Tout du plan Essentiel",
        "Multi-utilisateurs",
        "Support téléphonique 24/7",
        "Personnalisation complète",
        "Formation personnalisée",
        "Sauvegarde quotidienne"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Login Form */}
      <div className="relative overflow-hidden bg-blue-900 pb-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2000&auto=format&fit=crop"
            alt="Salon background"
            className="h-full w-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative pt-12 pb-16 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
            {/* Hero Content */}
            <div className="text-center lg:text-left lg:w-1/2 mb-12 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <Scissors className="w-8 h-8 text-blue-900 transform rotate-45" />
                </div>
                <h1 className="ml-4 text-4xl font-bold text-white">
                  SalonManager
                </h1>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-lg mx-auto lg:mx-0">
                La solution complète pour gérer votre salon de coiffure
              </h2>
              <p className="mt-4 text-lg text-blue-100 max-w-lg mx-auto lg:mx-0">
                Simplifiez la gestion de votre salon, augmentez votre productivité et offrez une meilleure expérience à vos clients.
              </p>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md">
              <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? "Connexion..." : "Se connecter"}
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Pas encore de compte ?{' '}
                      <Link
                        to="/register"
                        className="font-medium text-blue-900 hover:text-blue-800"
                      >
                        Créer un compte
                      </Link>
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden px-6 py-8"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <stat.icon className="h-6 w-6 text-blue-900" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Ce que nos utilisateurs disent
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez pourquoi les professionnels font confiance à SalonManager
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Des forfaits adaptés à vos besoins
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choisissez le plan qui correspond le mieux à votre activité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl ${
                  plan.highlighted
                    ? "bg-white ring-4 ring-blue-500 shadow-xl"
                    : "bg-white shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-5 inset-x-0 flex justify-center">
                    <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-blue-600 to-blue-400 shadow-md">
                      Le plus populaire
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price}€
                    </span>
                    <span className="ml-1 text-xl font-medium text-gray-500">
                      /{plan.period}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <button
                    onClick={() => setShowContactPopup(true)}
                    className={`w-full rounded-xl py-3 px-6 text-center text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-blue-900 text-white hover:bg-blue-800"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Sélectionner
                    <ArrowRight className="inline-block w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Contactez-nous
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Anna est à votre disposition pour répondre à vos demandes
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {showContactPopup && (
        <ContactPopup onClose={() => setShowContactPopup(false)} />
      )}
    </div>
  );
}