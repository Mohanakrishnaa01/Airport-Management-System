import { useState } from 'react'
import airplaneIcon from '../assets/airplane_icon.svg'

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, password}),
        });
        console.log(response);
    }

    return (
        <div className="login_Container">
            <img src={airplaneIcon} alt="airplane_logo"/>
            <div>
                <h1>Airport Management</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='form'>
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email address" value={email} name="email" onChange={e => setEmail(e.target.value)} />
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" value={password} name="password" onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit">LogIn</button>
            </form>
            <a>Forget Password?</a>
            <h6>@ 2025 Airport Management System</h6>
        </div>
    )
}