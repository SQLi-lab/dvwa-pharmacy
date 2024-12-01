import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button } from '@mui/material';
import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000'; // Базовый URL бэкенда


function LoginPage({ setLoggedIn }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/login', {
                username,
                password,
            }, {
                withCredentials: true, // Для работы с куками
            });

            console.log(response.data.message); // Успешный вход
            alert(response.data.message); // Показываем успешное сообщение
            setLoggedIn(true); // Устанавливаем статус входа
            navigate('/'); // Возвращаемся на главную страницу
        } catch (error) {
            if (error.response) {
                // Если сервер вернул ответ с ошибкой
                console.error('Ошибка:', error.response.data.message);
                alert(error.response.data.message);
            } else {
                // Если произошла сетевая ошибка или что-то другое
                console.error('Сетевая ошибка или другая проблема:', error.message);
                alert('Произошла ошибка. Попробуйте позже.');
            }
        }
    };


    return (
        <Container style={{ marginTop: '50px', textAlign: 'center' }}>
            <h1>Вход</h1>
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
            <Button variant="contained" color="primary" onClick={handleLogin}>
                Войти
            </Button>
        </Container>
    );
}

export default LoginPage;
