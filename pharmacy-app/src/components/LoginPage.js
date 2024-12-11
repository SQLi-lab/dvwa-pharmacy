import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Alert } from '@mui/material';
import BACKEND_URL from './Constants';

import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${BACKEND_URL}`; // Базовый URL бэкенда

function LoginPage({ setLoggedIn }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Для отображения ошибок
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setError(null); // Сбрасываем ошибку перед новой попыткой входа
            const response = await axios.post('/login', {
                username,
                password,
            });

            console.log(response.data.message); // Успешный вход
            //alert(response.data.message); // Показываем успешное сообщение
            setLoggedIn(true); // Устанавливаем статус входа
            navigate('/'); // Возвращаемся на главную страницу
        } catch (error) {
            if (error.response) {
                // Если сервер вернул ответ с ошибкой
                console.error('Ошибка:', error.response.data.message);
                setError(error.response.data.message);
            } else {
                // Если произошла сетевая ошибка или что-то другое
                console.error('Сетевая ошибка или другая проблема:', error.message);
                setError('Произошла ошибка. Попробуйте позже.');
            }
        }
    };

    return (
        <Container style={{ marginTop: '50px', textAlign: 'center' }}>
            <h1>Вход</h1>
            {error && (
                <Alert severity="error" style={{ marginBottom: '20px' }}>
                    {error}
                </Alert>
            )}
            <TextField
                label="Имя пользователя"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginBottom: '20px', width: '300px' }}
            />
            <br />
            <TextField
                label="Пароль"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginBottom: '20px', width: '300px' }}
            />
            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                disabled={!username || !password} // Блокируем кнопку, если поля пустые
            >
                Войти
            </Button>
        </Container>
    );
}

export default LoginPage;
