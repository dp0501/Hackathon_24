import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  LogOut,
  CheckCircle,
  Clock,
  MapPin,
  Users
} from 'lucide-react';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is student
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
        const userInfo = userDoc.docs[0]?.data();

        if (userInfo?.role === 'student') {
          setUser(user);
          setUserData(userInfo);
          loadData();
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      // Load all events
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);

      // Load user's registered events (this would need to be implemented in the data structure)
      // For now, we'll show all events and mark some as registered
      setRegisteredEvents(eventsData.slice(0, 2)); // Mock data
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    // This would update the event's attendees array and user's registered events
    // For now, just show an alert
    alert('Registration functionality would be implemented here');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">EventFlow</h1>
              <span className="text-purple-300">Student Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{userData?.name}</p>
                <p className="text-gray-300 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back, {userData?.name}!</h2>
              <p className="text-gray-300">Student ID: {userData?.studentId} | Department: {userData?.department}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Available Events</p>
                <p className="text-3xl font-bold text-white">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Registered Events</p>
                <p className="text-3xl font-bold text-green-400">{registeredEvents.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Upcoming Events</p>
                <p className="text-3xl font-bold text-blue-400">
                  {events.filter(event => new Date(event.date) >= new Date()).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
        </div>

        {/* Events Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Events */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Available Events</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-purple-300">{event.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.category === 'academic' ? 'bg-blue-600' :
                      event.category === 'cultural' ? 'bg-pink-600' :
                      event.category === 'sports' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {event.date} at {event.time}
                    <MapPin className="w-4 h-4 ml-4 mr-1" />
                    {event.location}
                    <Users className="w-4 h-4 ml-4 mr-1" />
                    {event.capacity} capacity
                  </div>
                  <button
                    onClick={() => handleRegisterForEvent(event.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Register for Event
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Registered Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">My Registered Events</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <div key={event.id} className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-green-300">{event.title}</h4>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {event.date} at {event.time}
                      <MapPin className="w-4 h-4 ml-4 mr-1" />
                      {event.location}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No registered events yet</p>
                  <p className="text-gray-500 text-sm">Browse available events to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
