import { useState } from 'react';
import { User, Shield, Link as LinkIcon, Mail, MessageCircle, Trash2 } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import MobileSidebar from '../components/Layout/MobileSidebar';
import { useOAuth2Auth } from '../context/OAuth2AuthContext';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useOAuth2Auth();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'connections', name: 'Connected Accounts', icon: LinkIcon },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const handleDisconnectService = (service: string) => {
    console.log(`Disconnecting ${service}...`);
    // Implement disconnect logic
  };

  const handleConnectService = (service: string) => {
    console.log(`Connecting ${service}...`);
    // Implement connect logic
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
      // Implement account deletion
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
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your account settings and preferences.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Tabs */}
              <div className="lg:w-64 flex-shrink-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1">
                {activeTab === 'profile' && (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
                      
                      <form className="space-y-6">
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                              <span className="text-2xl font-medium text-white">
                                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Change photo
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                              First name
                            </label>
                            <input
                              type="text"
                              name="first-name"
                              id="first-name"
                              defaultValue={user?.full_name?.split(' ')[0] || ''}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                              Last name
                            </label>
                            <input
                              type="text"
                              name="last-name"
                              id="last-name"
                              defaultValue={user?.full_name?.split(' ')[1] || ''}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email address
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              defaultValue={user?.email || ''}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'connections' && (
                  <div className="space-y-6">
                    {/* Gmail Connection */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Mail className="h-8 w-8 text-red-500 mr-4" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Gmail</h3>
                              <p className="text-sm text-gray-500">
                                Connect your Gmail account to analyze email messages
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Connected
                            </span>
                            <button
                              onClick={() => handleDisconnectService('gmail')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p>Last sync: 2 minutes ago</p>
                          <p>Messages analyzed: 1,247</p>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Connection */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MessageCircle className="h-8 w-8 text-green-500 mr-4" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">WhatsApp</h3>
                              <p className="text-sm text-gray-500">
                                Connect your WhatsApp to analyze chat messages
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Connected
                            </span>
                            <button
                              onClick={() => handleConnectService('whatsapp')}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                              Connect
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p>Connect WhatsApp to start analyzing your chat messages</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    
                    {/* Change Password */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                        
                        <form className="space-y-6">
                          <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                              Current password
                            </label>
                            <input
                              type="password"
                              name="current-password"
                              id="current-password"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                              New password
                            </label>
                            <input
                              type="password"
                              name="new-password"
                              id="new-password"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                              Confirm new password
                            </label>
                            <input
                              type="password"
                              name="confirm-password"
                              id="confirm-password"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Update password
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white shadow rounded-lg border border-red-200">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                        <p className="text-sm text-red-600 mb-6">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                        
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                            <p className="text-sm text-red-600">
                              Permanently delete your account and all associated data.
                            </p>
                          </div>
                          <button
                            onClick={handleDeleteAccount}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
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