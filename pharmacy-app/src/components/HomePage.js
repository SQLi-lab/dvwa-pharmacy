import React, { useState, useEffect } from 'react';
import { Grid, Container, Typography } from '@mui/material';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000'; // Базовый URL бэкенда

function HomePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Загружаем список товаров с бэкенда
        axios
            .get('http://127.0.0.1:5000/products')
            .then((response) => {
                setProducts(response.data);

                // Генерация уникальных категорий
                const uniqueCategories = [
                    'Все',
                    ...new Set(response.data.map((product) => product.category || 'Другое')),
                ];
                setCategories(uniqueCategories);
            })
            .catch((error) => {
                console.error('Ошибка загрузки товаров:', error);
            });
    }, []);

    const handleFilter = (category) => {
        const queryParam = category === 'Все' ? '' : `?category=${category}`;

        // Запрос к бэкенду с фильтром
        axios
            .get(`http://127.0.0.1:5000/products${queryParam}`)
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error('Ошибка фильтрации товаров:', error);
            });
    };

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Список товаров
            </Typography>

            {/* Панель фильтров */}
            <FilterPanel categories={categories} onFilter={handleFilter} />

            {/* Список товаров */}
            <Grid container spacing={2}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard
                            name={product.name}
                            description={product.description}
                            price={product.price}
                            image={product.image}
                        />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default HomePage;
