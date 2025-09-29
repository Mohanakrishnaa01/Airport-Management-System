import airplaneIcon from '../assets/airplane_icon.svg'
import { useAuth } from '../contexts/AuthContext'

export function NavBar() {
    const { user, logout } = useAuth();

    return (
        <div className="NavBar">
            <div>
                <h2>Airport Management System</h2>
                <img src={airplaneIcon} alt="airplane_logo"/>
            </div>
            {user && (
                <div style={{ display: 'flex',flexDirection: "column", alignItems: 'end', gap: '0px', padding: '15px'}}>
                    <span>Welcome, {user.user_id}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>({user.role})</span>
                    <button 
                        onClick={logout}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}