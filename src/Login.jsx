import { useState } from 'react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLogin && formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Here you would typically make an API call to handle authentication
        console.log('Form submitted:', formData);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}
                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p className="toggle-form">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="toggle-btn"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login; 