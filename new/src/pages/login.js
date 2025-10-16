import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { Navbar } from './components/Navbar';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (userData?.role === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/student-dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md shadow-2xl border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">Student Login</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="student@university.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <a href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign up here
              </a>
            </p>
            {/* Secret Admin Login - Click the EventFlow logo 3 times */}
            <div
              className="mt-4 text-xs text-gray-500 cursor-pointer select-none"
              onClick={handleAdminLogin}
              title="Click for admin access"
            >
              EventFlow © 2024
            </div>
          </div>

          {/* Admin Login Modal */}
          {showAdminLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700"
              >
                <h3 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h3>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      id="admin-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="admin@eventflow.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      id="admin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter admin password"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                      {loading ? 'Logging in...' : 'Admin Login'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(false)}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
