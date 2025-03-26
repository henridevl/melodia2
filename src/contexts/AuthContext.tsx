import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Définition de l'interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null; // Utilisateur actuel
  loading: boolean; // Indicateur de chargement
  signIn: (email: string, password: string) => Promise<void>; // Fonction de connexion
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>; // Fonction d'inscription
  signOut: () => Promise<void>; // Fonction de déconnexion
  resetPassword: (email: string) => Promise<void>; // Fonction de réinitialisation de mot de passe
}

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null); // État pour l'utilisateur actuel
  const [loading, setLoading] = useState(true); // État pour l'indicateur de chargement

  useEffect(() => {
    // Initialisation de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session); // Log de la session initiale
      setUser(session?.user ?? null); // Définir l'utilisateur à partir de la session
      setLoading(false); // Mettre à jour l'état de chargement
    });

    // Configuration de l'écouteur d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event); // Log de l'événement de changement d'état
      console.log('Current session:', session); // Log de la session actuelle
      setUser(session?.user ?? null); // Mettre à jour l'utilisateur
      setLoading(false); // Mettre à jour l'état de chargement
    });

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction d'inscription
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) throw authError;
      console.log('Sign Up Session:', authData.session); // Log de la session d'inscription

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
            },
          ])
          .select()
          .single();

        if (profileError) {
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Failed to create user profile');
        }
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Sign In Session:', data.session); // Log de la session de connexion
    } catch (error) {
      console.error('Error during sign in:', error);
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Signed out successfully');
      setUser(null); // S'assurer que l'état de l'utilisateur est réinitialisé
    } catch (error) {
      console.error('Error during sign out:', error);
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error during password reset:', error);
      if (error instanceof AuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // Fournir les valeurs du contexte aux composants enfants
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
