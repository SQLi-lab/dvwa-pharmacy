import React, { useState, useEffect } from 'react';
import BACKEND_URL from './Constants';
import { useNavigate } from 'react-router-dom';

import {
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Pagination,
} from '@mui/material';

// Функция для извлечения куки по имени
function getCookieByName(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function ProfilePage() {
    const navigate = useNavigate();
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true'; // Проверяем статус авторизации
        const userCookie = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('user='));

        if (!isLoggedIn || !userCookie) {
            navigate('/login'); // Редирект на страницу логина
        }
    }, [navigate]);


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
    const [orders, setOrders] = useState([]); // Список заказов
    const [reviews, setReviews] = useState([]); // Список отзывов
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Загружаем профиль пользователя, заказы и отзывы
    useEffect(() => {
        fetch(`${BACKEND_URL}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookieByName('user'),
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setUserData({
                    username: data.username,
                    name: data.name,
                    passport: data.passport_number || '',
                    birthDate: data.birth_date || '',
                    address: data.address || '',
                    phone: data.phone_number || '',
                    description: data.description || '',
                });
                setNewDescription(data.description || '');
                setOrders(data.orders || []); // Убедимся, что заказы отображаются
                setReviews(data.reviews || []);
            })
            .catch((error) => {
                console.error('Ошибка получения профиля:', error);
            });
    }, []);

    const showMessage = (message) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        const userCookie = getCookieByName('user');

        if (!userCookie) {
            console.error('Кука с именем "user" не найдена!');
            return;
        }

        fetch(`${BACKEND_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userCookie,
            },
            body: JSON.stringify({ description: newDescription }),
        })
            .then((response) => response.json())
            .then(() => {
                setUserData((prevData) => ({ ...prevData, description: newDescription }));
                setIsEditing(false);
                showMessage('Описание успешно обновлено!');
            })
            .catch((error) => {
                console.error('Ошибка сохранения описания:', error);
            });
    };

    const paginatedOrders = orders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
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

                <div style={{ marginTop: '20px' }}>
                    <Typography variant="h6" style={{ marginBottom: '10px' }}>
                        Ваши заказы:
                    </Typography>
                    {paginatedOrders.length === 0 ? (
                        <Typography>У вас нет заказов</Typography>
                    ) : (
                        <List>
                            {paginatedOrders.map((order, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${order.name} - ${order.price} руб.`} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    <Pagination
                        count={Math.ceil(orders.length / itemsPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                        style={{ marginTop: '10px' }}
                    />
                </div>

                <div style={{ marginTop: '20px' }}>
                    <Typography variant="h6" style={{ marginBottom: '10px' }}>
                        Отзывы:
                    </Typography>
                    {reviews.length === 0 ? (
                        <Typography>Отзывов пока нет</Typography>
                    ) : (
                        <List>
                            {reviews.map((review, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={review.text} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </div>
            </Paper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </Container>
    );
}

export default ProfilePage;
