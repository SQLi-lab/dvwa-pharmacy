import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import HomePage from './components/HomePage'; // Импорт главной страницы
import LoginPage from './components/LoginPage'; // Импорт страницы логина
import ProfilePage from './components/ProfilePage'; // Импорт личного кабинета
import './App.css';
import axios from 'axios';
axios.defaults.withCredentials = true; // Включить отправку куков
axios.defaults.baseURL = 'http://localhost:5000'; // Базовый URL бэкенда




function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    // Проверяем, залогинен ли пользователь (localStorage)
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('loggedIn');
        if (isLoggedIn === 'true') {
            setLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        setLoggedIn(false);
        localStorage.setItem('loggedIn', 'false');
        navigate('/'); // Перенаправление на главную
    };

    const handleLogin = () => {
        setLoggedIn(true);
        localStorage.setItem('loggedIn', 'true');
    };

    return (
        <>
            {/* Верхняя панель */}
            <AppBar position="static">
                <Toolbar>
                    {/* Кнопка с логотипом для перехода на главную */}
                    <Typography
                        variant="h6"
                        style={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Pharmacy App
                    </Typography>
                    {/* Навигация */}
                    {loggedIn ? (
                        <>
                            <Button color="inherit" component={Link} to="/profile">
                                Личный кабинет
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <Button color="inherit" component={Link} to="/login">
                            Войти
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Роуты */}
            <Container style={{ marginTop: '20px' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage setLoggedIn={handleLogin} />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </Container>
        </>
    );
}

export default App;
