import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

function ProductDetail({ addToCart }) {
    const { id } = useParams(); // Получаем ID товара из маршрута
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/products/${id}`)
            .then((response) => response.json())
            .then((data) => setProduct(data))
            .catch((error) => console.error('Ошибка загрузки товара:', error));
    }, [id]);

    if (!product) {
        return <Typography>Загрузка товара...</Typography>;
    }

    const handleAddToCart = () => {
        addToCart(product); // Добавляем товар в корзину
    };

    return (
        <Container style={{ marginTop: '20px' }}>
            <Paper elevation={3} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <Typography variant="h4">{product.name}</Typography>
                <Typography variant="body1" style={{ margin: '10px 0' }}>
                    {product.description}
                </Typography>
                <Typography variant="h6" style={{ margin: '10px 0' }}>
                    Цена: {product.price} руб.
                </Typography>
                <Typography variant="body2" style={{ margin: '10px 0' }}>
                    Категория: {product.category}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddToCart}
                    style={{ marginTop: '20px' }}
                >
                    Добавить в корзину
                </Button>
            </Paper>
        </Container>
    );
}

export default ProductDetail;
