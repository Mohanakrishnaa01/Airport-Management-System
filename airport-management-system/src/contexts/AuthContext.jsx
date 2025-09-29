import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context){
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            if (token) {
                try {
                    const response = await fetch('http://127.0.0.1:5000/api/validate-token', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (!response.ok) {
                        throw new Error('Token validation failed');
                    }

                    const data = await response.json();

                    if (data.valid) {
                        setUser({
                            user_id: data.user_id,
                            role: data.role,
                            id: data.id
                        });
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Token validation error:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        validateToken();
    }, [token])

    const login = async (email, password) => {
        try {            
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("data : ", data);
            
            if (data.status === 'approved'){
                const newToken = data.token;
                setToken(newToken);
                localStorage.setItem('token', newToken);
                setUser({
                    user_id: data.user_id,
                    role: data.role,
                    id: data.id
                });
                return { success: true, data };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error("Login error : ", error);
            return { success: false, message: 'Network Error' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null);
        setUser(null);
        navigate('/');
    }

    const isAuthenticated = () => {
        return !!token && !!user;
    }

    const isAdmin = () => {
        return user && user.role === 'admin';
    }

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    )
}