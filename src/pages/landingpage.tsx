import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Circle, Menu, X } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div>
      {/* Contenu de la section d'accueil */}
      <h2>Bienvenue sur Muser</h2>
      <p>Transformez vos idées en musique.</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <div>
      {/* Contenu de la section des fonctionnalités */}
      <h2>Fonctionnalités de Muser</h2>
      <p>Découvrez toutes les fonctionnalités de notre plateforme.</p>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstWord, setFirstWord] = useState(0);
  const [secondWord, setSecondWord] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const words = [
    'Créer.',
    'Collaborer.',
    'Enregistrer.',
    'Jouer.',
    'Partager.',
    'Organiser.',
    'Chanter.',
    'Noter.',
    'Écouter.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFirstWord((prev) => (prev + 1) % words.length);
      setSecondWord((prev) => (prev + 1) % words.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Circle className="w-8 h-8" />
            <span className="text-xl font-bold">Muser.</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:underline">Home</Link>
            <Link to="/" className="font-medium hover:underline">Muser ?</Link>
            <Link to="/" className="font-medium hover:underline">Notre histoire</Link>
            <Link to="/features" className="font-medium hover:underline">Fonctionnalités</Link>
            <Link to="/" className="font-medium hover:underline">S'inscrire</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden px-6 py-4 bg-white border-b">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="font-medium">Home</Link>
              <Link to="/" className="font-medium">Muser ?</Link>
              <Link to="/" className="font-medium">Notre histoire</Link>
              <Link to="/features" className="font-medium">Fonctionnalités</Link>
              <Link to="/" className="font-medium">S'inscrire</Link>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
        </Routes>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold space-y-2">
              <div className="h-[4.5rem] md:h-[5.5rem] overflow-hidden relative">
                <div className={`transition-transform duration-500 absolute w-full`}>
                  {words[firstWord]}
                </div>
              </div>
              <div className="h-[4.5rem] md:h-[5.5rem] overflow-hidden relative">
                <div className={`transition-transform duration-500 absolute w-full`}>
                  {words[secondWord]}
                </div>
              </div>
              <div>Muser.</div>
            </h1>

            <div className="w-full max-w-md mt-12">
              <label htmlFor="email" className="sr-only">E-mail</label>
              <div className="flex gap-4">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  className="flex-1 px-4 py-3 border-b border-black focus:outline-none"
                />
                <button className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-colors">
                  Découvrir
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Marquee Text */}
        <div className="overflow-hidden py-8">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-xl font-light tracking-wide">
              Transformez vos idées en musique • Organisez votre talent • Créez sans limites •
              Transformez vos idées en musique • Organisez votre talent • Créez sans limites
            </span>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default LandingPage;
