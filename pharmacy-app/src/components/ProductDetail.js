import React, { useState, useEffect } from 'react';
import BACKEND_URL from './Constants';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    TextField,
    Paper,
    Box
} from '@mui/material';
import images from './imagesLoader'; // Импортируем лоадер изображений

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
    const { medication_id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [username, setUsername] = useState('');

    // Проверка авторизации
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const userCookie = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('user='));

        if (!isLoggedIn || !userCookie) {
            navigate('/login');
        }
    }, [navigate]);

    // Загрузка данных о продукте и отзывах
    useEffect(() => {
        // Загружаем информацию о продукте
        fetch(`${BACKEND_URL}/products/${medication_id}`)
            .then((response) => response.json())
            .then((data) => {
                const productWithImage = {
                    ...data,
                    image: images[data.medication_id % images.length],
                };
                setProduct(productWithImage);
            })
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
                setReviews((prev) => [...prev, { username: username || 'guest', review_text: newReview }]);
                setNewReview('');
            })
            .catch((error) => console.error('Ошибка добавления отзыва:', error));
    };

    if (!product) return <Typography>Загрузка...</Typography>;

    return (
        <Container style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Карточка продукта */}
            <Paper style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px' }}>
                <img
                    src={product.image || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                    }}
                />
                <div>
                    <Typography variant="h4" gutterBottom>{product.name}</Typography>
                    <Typography variant="body1" style={{ marginBottom: '10px' }}>
                        Количество: {product.stock}
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '10px' }}>
                        Цена: {product.price} руб.
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '20px' }}>
                        Категория: {product.category}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => addToCart(product)}
                        style={{ marginTop: '20px' }}
                    >
                        Добавить в корзину
                    </Button>
                </div>
            </Paper>

            {/* Блок отзывов */}
            <Paper style={{ padding: '20px' }}>
                <Typography variant="h5" gutterBottom>
                    Отзывы
                </Typography>
                {reviews.length > 0 ? (
                    <>
                        {reviews.map((review, index) => (
                            <Paper
                                key={index}
                                elevation={1}
                                style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    border: '1px solid #ccc',
                                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff'
                                }}
                            >
                                <Typography >Автор: {review.username || 'guest'}</Typography>
                                <Typography style={{ marginTop: '5px' }}>{review.review_text}</Typography>
                            </Paper>
                        ))}
                    </>
                ) : (
                    <Typography>Отзывов пока нет. Будьте первым!</Typography>
                )}
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
