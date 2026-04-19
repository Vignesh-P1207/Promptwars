import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Flow from './pages/Flow'
import Zones from './pages/Zones'
import Analytics from './pages/Analytics'
import System from './pages/System'
import Alerts from './pages/Alerts'
import Assistant from './pages/Assistant'

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flow" element={<Flow />} />
          <Route path="/zones" element={<Zones />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/system" element={<System />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>

        <Footer />
      </main>
    </div>
  )
}
