import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper } from '@mui/material';

// Функция для извлечения куки по имени
function getCookieByName(name) {
    const cookies = document.cookie.split(';');
    console.log(cookies)
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function ProfilePage() {
    const [userData, setUserData] = useState({
        username: '',
        name: '',
        passport: '',
        birthDate: '',
        address: '',
        phone: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:5000/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':  getCookieByName('user'),
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setUserData({
                    username: data.username,
                    name: data.name,
                    passport: data.passport_number,
                    birthDate: data.birth_date,
                    address: data.address,
                    phone: data.phone_number,
                    description: data.description,
                });
                setNewDescription(data.description);
            })
            .catch((error) => {
                console.error('Ошибка получения профиля:', error);
            });
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        const userCookie = getCookieByName('user'); // Получаем куку с именем `user`

        if (!userCookie) {
            console.error('Кука с именем "user" не найдена!');
            return;
        }

        fetch('http://127.0.0.1:5000/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Cookie ${userCookie}`, // Передаём куку в заголовке Authorization
            },
            body: JSON.stringify({ description: newDescription }),
        })
            .then((response) => response.json())
            .then(() => {
                setUserData((prevData) => ({ ...prevData, description: newDescription }));
                setIsEditing(false);
                //alert('Описание обновлено!');
            })
            .catch((error) => {
                console.error('Ошибка сохранения описания:', error);
            });
    };

    return (
        <Container style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Paper elevation={3} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <Typography variant="h5" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {userData.username}
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Аватар пользователя"
                        style={{ borderRadius: '50%', marginRight: '20px', width: '150px', height: '150px' }}
                    />
                    <div>
                        <Typography variant="h6">{userData.name}</Typography>
                        <Typography>Паспорт: {userData.passport}</Typography>
                        <Typography>Дата рождения: {userData.birthDate}</Typography>
                        <Typography>Адрес: {userData.address}</Typography>
                        <Typography>Телефон: {userData.phone}</Typography>
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Typography variant="h6" style={{ marginBottom: '10px' }}>
                        Описание:
                    </Typography>
                    {!isEditing ? (
                        <div>
                            <Typography
                                style={{
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    backgroundColor: '#f9f9f9',
                                    display: 'inline-block',
                                    maxWidth: '100%',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {userData.description || 'Описание отсутствует'}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleEdit}
                                style={{ marginLeft: '20px' }}
                            >
                                Редактировать
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <TextField
                                label="Редактировать описание"
                                variant="outlined"
                                multiline
                                rows={4}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                style={{ width: '100%', maxWidth: '600px', marginBottom: '20px' }}
                            />
                            <Button variant="contained" color="primary" onClick={handleSave}>
                                Сохранить
                            </Button>
                        </div>
                    )}
                </div>
            </Paper>
        </Container>
    );
}

export default ProfilePage;
