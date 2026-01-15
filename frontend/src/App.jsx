import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { LiveMonitor } from './components/LiveMonitor';
import { UserManagement } from './components/UserManagement';
import { AttendanceLogs } from './components/AttendanceLogs';

export default function App() {
    const [activeTab, setActiveTab] = useState('live');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <Layout
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            />

            {activeTab === 'live' && <LiveMonitor />}
            {activeTab === 'users' && <div className="p-8"><UserManagement /></div>}
            {activeTab === 'dashboard' && <div className="p-8"><AttendanceLogs /></div>}
        </Layout>
    );
}
