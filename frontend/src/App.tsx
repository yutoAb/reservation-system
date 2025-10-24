import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { TimeSlotList } from './components/reservations/TimeSlotList';
import { MyReservations } from './components/reservations/MyReservations';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Calendar } from 'lucide-react';

function AppContent() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showLogin ? (
          <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Reservation System</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
                {isAdmin && <span className="ml-2 text-blue-600 font-semibold">(Admin)</span>}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isAdmin ? (
          <Tabs defaultValue="book" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="book">Book Slot</TabsTrigger>
              <TabsTrigger value="my-reservations">My Reservations</TabsTrigger>
              <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
            </TabsList>
            <TabsContent value="book">
              <TimeSlotList />
            </TabsContent>
            <TabsContent value="my-reservations">
              <MyReservations />
            </TabsContent>
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="book" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="book">Book Slot</TabsTrigger>
              <TabsTrigger value="my-reservations">My Reservations</TabsTrigger>
            </TabsList>
            <TabsContent value="book">
              <TimeSlotList />
            </TabsContent>
            <TabsContent value="my-reservations">
              <MyReservations />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
