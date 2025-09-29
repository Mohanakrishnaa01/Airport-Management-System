import { useState } from 'react'
import airplaneIcon from '../assets/airplane_icon.svg'
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success){
                const { role, id } = result.data;

                if (role === 'admin') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate(`/worker?tech_id=${id}`, { replace: true });
                }
            } else {
                setError(result.message || "Login Failed");
            }
        } catch (error) {
            setError("An error occured during login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login_Container">
            <img src={airplaneIcon} alt="airplane_logo"/>
            <div>
                <h1>Airport Management</h1>
            </div>
            
            {error && (
                <div style={{ 
                    color: 'red', 
                    marginBottom: '10px', 
                    textAlign: 'center',
                    padding: '10px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '5px'
                }}>
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className='form'>
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email address" value={email} name="email" onChange={e => setEmail(e.target.value)} required disabled={loading}/>
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" value={password} name="password" onChange={e => setPassword(e.target.value)}  required disabled={loading}/>
                </div>
                <button type="submit" disabled={loading}>{loading ? 'Logging in...' : "LogIn"}</button>
            </form>
            <a>Forget Password?</a>
            <h6>@ 2025 Airport Management System</h6>
        </div>
    )
}