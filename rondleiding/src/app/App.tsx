import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import { AdminPanel } from './components/AdminPanel';
import { UserMap } from './components/UserMap';
import { TourNavigator } from './components/TourNavigator';
import { LoginPage } from './components/LoginPage';
import { Button } from './components/ui/button';
import { Settings, Map } from 'lucide-react';
import type { TourPoint } from './components/types';

function AppContent() {
  const [tourPoints, setTourPoints] = useState<TourPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<TourPoint | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Demo data voor development (verwijderd zodra backend werkt)
  useEffect(() => {
    const demoPoints: TourPoint[] = [
      {
        id: '1',
        name: 'hoofdingang',
        description: 'de centrale toegang tot ons gebouw waar je terecht kunt voor informatie',
        x: 30,
        y: 40,
        slides: [
          {
            id: '1-1',
            order: 0,
            instruction: 'loop 200m rechtdoor vanaf de parkeerplaats',
          },
          {
            id: '1-2',
            order: 1,
            instruction: 'ga naar rechts, de trap 1 verdieping omhoog',
          },
          {
            id: '1-3',
            order: 2,
            instruction: 'je bent aangekomen bij de hoofdingang! hier vind je de receptie.',
          }
        ]
      },
      {
        id: '2',
        name: 'technieklab',
        description: 'moderne werkplaats voor praktijkonderwijs in technische vakken',
        x: 70,
        y: 60,
        slides: [
          {
            id: '2-1',
            order: 0,
            instruction: 'ga vanaf de hoofdingang naar links door de blauwe gang',
          },
          {
            id: '2-2',
            order: 1,
            instruction: 'neem de tweede deur aan je rechterhand',
          }
        ]
      }
    ];
    setTourPoints(demoPoints);
  }, []);

  const handleSelectPoint = (point: TourPoint) => {
    setSelectedPoint(point);
    navigate('/tour');
  };

  const handleCloseTour = () => {
    setSelectedPoint(null);
    navigate('/');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="size-full">
      {/* Navigatie toggle */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white shadow-md"
        >
          <Map className="w-4 h-4 mr-2" />
          kaart
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
          className="bg-white shadow-md"
        >
          <Settings className="w-4 h-4 mr-2" />
          admin
        </Button>
        {isAuthenticated ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-white shadow-md"
          >
            uitloggen
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="bg-white shadow-md"
          >
            inloggen
          </Button>
        )}
      </div>

      <Routes>
        <Route path="/" element={<UserMap tourPoints={tourPoints} onSelectPoint={handleSelectPoint} />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/tour"
          element={
            selectedPoint ? (
              <TourNavigator tourPoint={selectedPoint} onClose={handleCloseTour} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}