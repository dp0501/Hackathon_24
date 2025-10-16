import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Menu,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Save,
  UserPlus,
  CalendarPlus,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    category: 'academic'
  });

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    studentId: '',
    department: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
        const userData = userDoc.docs[0]?.data();

        if (userData?.role === 'admin') {
          setUser(user);
          loadData();
          setupRealtimeListeners();
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

  const setupRealtimeListeners = () => {
    // Real-time listener for events
    const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
    const eventsUnsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    });

    // Real-time listener for students
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const studentsUnsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    });

    // Return cleanup function
    return () => {
      eventsUnsubscribe();
      studentsUnsubscribe();
    };
  };

  const loadData = async () => {
    try {
      // Load events
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);

      // Load students
      const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), {
        ...eventForm,
        capacity: parseInt(eventForm.capacity),
        createdAt: new Date(),
        attendees: []
      });
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        category: 'academic'
      });
      loadData();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        ...studentForm,
        role: 'student',
        createdAt: new Date()
      });
      setStudentForm({
        name: '',
        email: '',
        studentId: '',
        department: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        loadData();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'users', studentId));
        loadData();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'events', label: 'Events Management', icon: Calendar },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-purple-400">EventFlow Admin</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-700 transition-colors ${
                  activeTab === item.id ? 'bg-purple-600 text-white' : 'text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-purple-400 lg:ml-0 ml-4">
            {sidebarItems.find(item => item.id === activeTab)?.label}
          </h1>
          <div className="text-sm text-gray-400">
            Welcome, {user?.email}
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Create Event Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Event
                </h3>
                <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Capacity"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="technical">Technical</option>
                  </select>
                  <textarea
                    placeholder="Description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    required
                  />
                  <button
                    type="submit"
                    className="md:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Create Event
                  </button>
                </form>
              </motion.div>

              {/* Events List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4">All Events</h3>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-400">{event.title}</h4>
                        <p className="text-sm text-gray-400">{event.date} at {event.time}</p>
                        <p className="text-sm text-gray-400">{event.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Create Student Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Student
                </h3>
                <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Student ID"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({...studentForm, department: e.target.value})}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="submit"
                    className="md:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Student
                  </button>
                </form>
              </motion.div>

              {/* Students List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4">All Students</h3>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-400">{student.name}</h4>
                        <p className="text-sm text-gray-400">{student.email}</p>
                        <p className="text-sm text-gray-400">ID: {student.studentId} | Dept: {student.department}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Total Events</p>
                      <p className="text-3xl font-bold text-purple-400">{events.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Total Students</p>
                      <p className="text-3xl font-bold text-green-400">{students.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Active Events</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {events.filter(event => new Date(event.date) >= new Date()).length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                  </div>
                </motion.div>
              </div>

              {/* Charts Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4">Event Categories Distribution</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Chart visualization would go here (requires chart library like Chart.js or Recharts)
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-4">System Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@eventflow.com"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Event Capacity
                  </label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Save Settings
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
