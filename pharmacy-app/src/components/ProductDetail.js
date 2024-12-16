import React, { useState, useEffect } from 'react';
import BACKEND_URL from './Constants';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    TextField,
    Paper,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';

// Функция для получения куки
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

function ProductDetail({ addToCart }) {
    const { medication_id } = useParams(); // Получаем medication_id продукта из маршрута
    const [product, setProduct] = useState(null); // Данные продукта
    const [reviews, setReviews] = useState([]); // Отзывы
    const [newReview, setNewReview] = useState(''); // Новый отзыв
    const [username, setUsername] = useState(''); // Имя пользователя

    // Загрузка данных о продукте и отзывах
    useEffect(() => {
        // Загружаем информацию о продукте
        fetch(`${BACKEND_URL}/products/${medication_id}`)
            .then((response) => response.json())
            .then((data) => setProduct(data))
            .catch((error) => console.error('Ошибка загрузки продукта:', error));

        // Загружаем отзывы для продукта
        fetch(`${BACKEND_URL}/products/${medication_id}/reviews`)
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setReviews(data);
                } else {
                    setReviews([]);
                }
            })
            .catch((error) => console.error('Ошибка загрузки отзывов:', error));

        // Получаем имя пользователя из куки
        const userCookie = getCookieByName('user');
        if (userCookie) {
            setUsername(userCookie);
        }
    }, [medication_id]);

    // Добавление нового отзыва
    const handleAddReview = () => {
        if (!newReview.trim()) {
            alert('Пожалуйста, введите текст отзыва!');
            return;
        }

        const userCookie = getCookieByName('user');

        fetch(`${BACKEND_URL}/products/${medication_id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userCookie,
            },
            body: JSON.stringify({ review: newReview }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Ошибка добавления отзыва');
                }
                return response.json();
            })
            .then(() => {
                // Добавляем новый отзыв в список
                setReviews((prev) => [...prev, { username: username || 'guest', text: newReview }]);
                setNewReview(''); // Очищаем поле ввода
            })
            .catch((error) => console.error('Ошибка добавления отзыва:', error));
    };

    // Показываем сообщение "Загрузка...", если данные о продукте ещё не пришли
    if (!product) return <Typography>Загрузка...</Typography>;

    return (
        <Container>
            {/* Карточка продукта */}
            <Paper style={{ padding: '20px', marginBottom: '20px' }}>
                <Typography variant="h4">{product.name}</Typography>
                <Typography>Количество: {product.stock}</Typography>
                <Typography>Цена: {product.price} руб.</Typography>
                <Typography>Категория: {product.category}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addToCart(product)}
                >
                    Добавить в корзину
                </Button>
            </Paper>

            {/* Блок отзывов */}
            <Paper style={{ padding: '20px' }}>
                <Typography variant="h5" gutterBottom>
                    Отзывы
                </Typography>
                <List>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={review.review_text}
                                    secondary={`Автор: ${review.username}`}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography>Отзывов пока нет. Будьте первым!</Typography>
                    )}
                </List>
                <TextField
                    label="Оставить отзыв"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    style={{ marginTop: '20px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddReview}
                    style={{ marginTop: '10px' }}
                >
                    Отправить
                </Button>
            </Paper>
        </Container>
    );
}

export default ProductDetail;
