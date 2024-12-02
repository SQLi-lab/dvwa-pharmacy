import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Paper } from '@mui/material';
import axios from 'axios';

function ProfilePage() {
    const [userData, setUserData] = useState({
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
        // Загружаем данные профиля
        axios
            .get('http://127.0.0.1:5000/profile', { withCredentials: true })
            .then((response) => {
                setUserData({
                    name: response.data.name,
                    passport: response.data.passport_number,
                    birthDate: response.data.birth_date,
                    address: response.data.address,
                    phone: response.data.phone_number,
                    description: response.data.description,
                });
                setNewDescription(response.data.description);
            })
            .catch((error) => {
                console.error('Ошибка получения профиля:', error);
            });
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        axios
            .post(
                'http://127.0.0.1:5000/profile',
                { description: newDescription },
                { withCredentials: true }
            )
            .then(() => {
                setUserData((prevData) => ({ ...prevData, description: newDescription }));
                setIsEditing(false);
                alert('Описание обновлено!');
            })
            .catch((error) => {
                console.error('Ошибка сохранения описания:', error);
            });
    };

    return (
        <Container style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Paper elevation={3} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Аватар пользователя"
                        style={{ borderRadius: '50%', marginRight: '20px', width: '150px', height: '150px' }}
                    />
                    <div>
                        <Typography variant="h5">{userData.name}</Typography>
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
