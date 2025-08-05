import { useState, useEffect } from 'react';
import { RefreshCw, Mail, XCircle } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import MessageCard, { Message } from '../components/UI/MessageCard';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';
import ApiService from '../services/api';

interface GmailStatus {
  gmail_fetcher: string;
  scheduler_running: boolean;
  ai_engine_url: string;
  status: string;
}

interface FetchResult {
  success: boolean;
  fetched_count: number;
  messages: Message[];
  errors: string[];
  last_sync: string;
}

export default function GmailTest() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [lastFetchResult, setLastFetchResult] = useState<FetchResult | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useOAuth2Auth();

  // Function pour déboguer l'authentification
  const debugAuthentication = () => {
    console.log('🔍 ==> DEBUGGING AUTHENTICATION STATE <==');
    
    // Debug du service API
    const authState = ApiService.debugAuthState();
    console.log('📊 Auth State:', authState);
    
    // Extraire l'ID du token JWT si disponible
    let extractedUserId = null;
    if (authState.hasToken) {
      try {
        const token = ApiService.getAuthToken();
        const payload = JSON.parse(atob(token.split('.')[1]));
        extractedUserId = payload.sub || payload.user_id || payload.id;
        console.log('🆔 Token Payload:', {
          sub: payload.sub,
          user_id: payload.user_id,
          id: payload.id,
          email: payload.email,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A'
        });
      } catch (err) {
        console.error('❌ Erreur parsing token:', err);
      }
    }
    
    // Debug du contexte utilisateur
    console.log('👤 User Context:', {
      user: user,
      userId: user?.id,
      userEmail: user?.email,
      hasUser: !!user,
      extractedUserId: extractedUserId
    });
    
    // Vérifier les données dans les storage
    console.log('💾 Storage Data:', {
      sessionStorage: {
        jwt_token: sessionStorage.getItem('jwt_token') ? 'EXISTS' : 'MISSING',
        user_email: sessionStorage.getItem('user_email'),
        user_name: sessionStorage.getItem('user_name')
      },
      localStorage: {
        user: localStorage.getItem('user') ? 'EXISTS' : 'MISSING'
      }
    });
    
    return { ...authState, extractedUserId };
  };

  // Charger le statut Gmail au démarrage
  useEffect(() => {
    // Debug l'authentification avant tout
    debugAuthentication();
    loadGmailStatus();
  }, []);

  // Auto-charger les messages si Gmail est connecté
  useEffect(() => {
    if (gmailStatus && gmailStatus.gmail_fetcher === 'connected' && recentMessages.length === 0) {
      // Attendre un peu pour que l'interface soit prête
      const timer = setTimeout(() => {
        testGmailMessagesDirect();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gmailStatus]);

  const loadGmailStatus = async () => {
    try {
      setError(null);
      
      // Vérifier l'authentification avant d'appeler l'API
      const authState = debugAuthentication();
      
      if (!authState.hasToken) {
        throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
      }
      
      if (authState.isExpired) {
        throw new Error('Token d\'authentification expiré. Veuillez vous reconnecter.');
      }
      
      if (!user) {
        throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
      }
      
      // Utiliser le service API structuré
      console.log('📞 Appel API: getGmailStatus...');
      const status = await ApiService.getGmailStatus();
      console.log('📊 Statut Gmail récupéré:', status);
      
      setGmailStatus({
        gmail_fetcher: status.gmail_connected ? 'connected' : 'not_connected',
        scheduler_running: false,
        ai_engine_url: 'N/A - Direct Mode',
        status: status.gmail_connected ? 'healthy' : 'disconnected'
      });
      
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement du statut Gmail:', err);
      
      // Gestion spécifique des erreurs d'authentification
      if (err.message.includes('401') || err.message.includes('Unauthorized') || 
          err.message.includes('Token') || err.message.includes('authentification')) {
        setError(`🔑 Problème d'authentification: ${err.message}\n\n➡️ Solution: Reconnectez-vous si nécessaire.`);
      } else {
        setError(`Erreur: ${err.message || 'Erreur inconnue'}`);
      }
      
      // En cas d'erreur, créer un statut simulé pour les tests
      const mockStatus: GmailStatus = {
        gmail_fetcher: 'error',
        scheduler_running: false,
        ai_engine_url: 'Error - Auth Required',
        status: 'auth_error'
      };
      setGmailStatus(mockStatus);
    }
  };

  const connectGmail = async () => {
    try {
      console.log('🔗 Démarrage de la connexion Gmail...');
      
      // Debug de l'authentification
      const authState = debugAuthentication();
      console.log('🔍 Auth State avant connexion Gmail:', authState);
      
      if (!user?.email) {
        throw new Error(`Utilisateur non connecté. User: ${JSON.stringify(user)}`);
      }
      
      if (!authState.hasToken) {
        throw new Error('Token JWT manquant. Veuillez vous reconnecter.');
      }
      
      if (authState.isExpired) {
        throw new Error('Token JWT expiré. Veuillez vous reconnecter.');
      }
      
      // Extraire l'ID utilisateur du token JWT
      let userId = user.id;
      if (!userId && authState.hasToken) {
        try {
          const token = ApiService.getAuthToken();
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.sub || payload.user_id || payload.id;
          console.log('� ID utilisateur extrait du token:', userId);
        } catch (err) {
          console.error('❌ Erreur extraction ID du token:', err);
        }
      }
      
      if (!userId) {
        throw new Error(`ID utilisateur non trouvé. Token payload: vérifiez la console`);
      }
      
      console.log('�📞 Appel API: initGoogleAuth avec userId:', userId);
      
      // Obtenir l'URL d'autorisation Gmail via le service API
      const data = await ApiService.initGoogleAuth(userId);
      console.log('✅ Réponse initGoogleAuth:', data);
      
      if (data.authorization_url) {
        // Afficher un message d'information
        setError(null);
        console.log('✅ Redirection vers l\'autorisation Gmail...');
        console.log('🔗 URL d\'autorisation:', data.authorization_url);
        
        // Ouvrir l'URL d'autorisation Gmail dans une nouvelle fenêtre
        const authWindow = window.open(data.authorization_url, 'gmail_auth', 'width=500,height=600,scrollbars=yes,resizable=yes');
        
        if (!authWindow) {
          throw new Error('Impossible d\'ouvrir la fenêtre d\'autorisation. Vérifiez que les popups ne sont pas bloqués.');
        }
        
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            console.log('🔄 Fenêtre d\'autorisation fermée, rafraîchissement du statut...');
            setTimeout(() => {
              loadGmailStatus();
            }, 2000);
          }
        }, 1000);
      } else {
        throw new Error(`URL d'autorisation non reçue. Réponse: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || err.detail || 'Erreur inconnue';
      console.error('❌ Erreur connexion Gmail:', err);
      console.error('❌ Détails erreur:', {
        message: errorMessage,
        user: user,
        hasToken: !!ApiService.getAuthToken(),
        error: err
      });
      
      // Messages d'erreur plus informatifs
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Token')) {
        setError(`🔑 Erreur d'authentification: ${errorMessage}\n\n➡️ Solution: Cliquez sur "Reconnexion" pour vous reconnecter.`);
      } else {
        setError(`❌ Erreur lors de la connexion Gmail: ${errorMessage}\n\n🔍 Vérifiez la console pour plus de détails.`);
      }
    }
  };

  const testGmailMessagesDirect = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setError(null);
      setIsFetching(true);
      console.log('📧 Test direct des messages Gmail...');
      
      // Utiliser la méthode structurée du service API
      const liveMessagesResponse = await ApiService.getGmailMessagesLive(5);
      console.log('🔍 Résultat du test direct:', liveMessagesResponse);
      
      if (liveMessagesResponse.success && liveMessagesResponse.messages && liveMessagesResponse.messages.length > 0) {
        console.log('✅ Messages Gmail trouvés via API:', liveMessagesResponse.messages);
        
        // Afficher les messages directement
        setRecentMessages(liveMessagesResponse.messages);
        setError(null);
        
        // Mettre à jour le résultat de récupération pour l'affichage
        const fetchResult: FetchResult = {
          success: true,
          fetched_count: liveMessagesResponse.messages.length,
          messages: liveMessagesResponse.messages,
          errors: [],
          last_sync: new Date().toISOString()
        };
        setLastFetchResult(fetchResult);
        
      } else {
        console.log('⚠️ Aucun message trouvé');
        setError(`Aucun message trouvé dans votre boîte Gmail. Gmail connecté: ${liveMessagesResponse.gmail_connected ? 'Oui' : 'Non'}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur test direct Gmail:', err);
      
      if (errorMessage.includes('Gmail not connected')) {
        setError('Gmail non connecté. Cliquez sur "Connecter Gmail" pour autoriser l\'accès à votre compte.');
      } else {
        setError(`Erreur lors du test direct Gmail: ${errorMessage}`);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div>
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />

      <div className="lg:pl-72">
        <TopBar onMobileMenuOpen={() => setSidebarOpen(true)} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Messages Gmail</h1>
                  <p className="mt-2 text-lg text-gray-600">
                    Consultez vos derniers emails Gmail
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Bouton principal selon l'état */}
                  {!gmailStatus || gmailStatus.gmail_fetcher !== 'connected' ? (
                    <button
                      onClick={connectGmail}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Connecter Gmail
                    </button>
                  ) : (
                    <button
                      onClick={testGmailMessagesDirect}
                      disabled={isFetching}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className={`h-5 w-5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                      {isFetching ? 'Chargement...' : 'Actualiser les emails'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Erreur ou information */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Une erreur s'est produite</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                      {error.includes('Gmail non connecté') && (
                        <div className="mt-3">
                          <button
                            onClick={connectGmail}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Connecter Gmail maintenant
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistiques si Gmail connecté */}
            {gmailStatus && gmailStatus.gmail_fetcher === 'connected' && lastFetchResult && (
              <div className="mb-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dernière synchronisation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{lastFetchResult.fetched_count}</div>
                    <div className="text-sm text-gray-500">Messages récupérés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {lastFetchResult.success ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-500">Statut</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{formatDate(lastFetchResult.last_sync)}</div>
                    <div className="text-sm text-gray-500">Dernière mise à jour</div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Récents */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Vos emails Gmail</h3>
                  <span className="text-sm text-gray-500">{recentMessages.length} messages</span>
                </div>
              </div>

              <div className="p-6">
                {recentMessages.length > 0 ? (
                  <div className="space-y-4">
                    {recentMessages.map((message, index) => (
                      <MessageCard 
                        key={message.id || index} 
                        message={message}
                        onClick={() => console.log('Message clicked:', message)}
                        onCorrect={() => console.log('Correct message:', message)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-16 w-16 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun message</h3>
                    <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
                      {!user ? 'Connectez-vous à votre compte pour voir vos messages Gmail.' :
                       !gmailStatus || gmailStatus.gmail_fetcher !== 'connected' ? 
                       'Connectez votre compte Gmail pour récupérer vos messages.' :
                       'Cliquez sur "Actualiser les emails" pour charger vos derniers messages.'}
                    </p>
                    {!gmailStatus || gmailStatus.gmail_fetcher !== 'connected' ? (
                      <div className="mt-6">
                        <button
                          onClick={connectGmail}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Mail className="h-5 w-5 mr-2" />
                          Connecter Gmail
                        </button>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <button
                          onClick={testGmailMessagesDirect}
                          disabled={isFetching}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <RefreshCw className={`h-5 w-5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                          {isFetching ? 'Chargement...' : 'Charger les emails'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
