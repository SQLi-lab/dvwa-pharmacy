import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function ProfilePage() {
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        // Загружаем данные профиля
        axios
            .get('http://127.0.0.1:5000/profile', { withCredentials: true })
            .then((response) => {
                setUsername(response.data.username);
                setDescription(response.data.description);
                setNewDescription(response.data.description); // Изначально совпадает с текущим описанием
            })
            .catch((error) => {
                console.error('Ошибка получения профиля:', error);
            });
    }, []);

    const handleSave = () => {
        // Сохраняем новое описание
        axios
            .post(
                'http://127.0.0.1:5000/profile',
                { description: newDescription },
                { withCredentials: true }
            )
            .then(() => {
                setDescription(newDescription); // Обновляем отображаемое описание
                alert('Профиль обновлён!');
            })
            .catch((error) => {
                console.error('Ошибка обновления профиля:', error);
            });
    };

    return (
        <Container style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <Typography variant="h4" style={{ marginBottom: '20px' }}>
                Личный кабинет
            </Typography>
            <Typography variant="h6" style={{ marginBottom: '20px' }}>
                Имя пользователя: {username}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '20px' }}>
                Текущее описание:
            </Typography>
            <Typography
                variant="body2"
                style={{
                    marginBottom: '20px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9',
                    display: 'inline-block',
                    maxWidth: '400px',
                }}
            >
                {description || 'Описание отсутствует'}
            </Typography>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Новое описание"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={newDescription || ""} // Если newDescription равен null, используется пустая строка
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{ width: '400px' }}
                />

            </div>
            <Button variant="contained" color="primary" onClick={handleSave}>
                Сохранить
            </Button>
        </Container>
    );
}

export default ProfilePage;
