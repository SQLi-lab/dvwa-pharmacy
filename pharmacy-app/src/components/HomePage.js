import React, { useState, useEffect } from 'react';
import { Grid, Container, Typography } from '@mui/material';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import axios from 'axios';

function HomePage({ addToCart }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        // Загружаем список товаров
        axios.get('/products')
            .then((response) => {
                const data = response.data;
                setProducts(data);
                setFilteredProducts(data);

                // Уникальные категории
                const uniqueCategories = [
                    'Все',
                    ...new Set(data.map((product) => product.category || 'Другое')),
                ];
                setCategories(uniqueCategories);
            })
            .catch((error) => {
                console.error('Ошибка загрузки товаров:', error);
            });
    }, []);

    const handleFilter = (category) => {
        if (category === 'Все') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter((product) => product.category === category));
        }
    };

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Список товаров
            </Typography>
            <FilterPanel categories={categories} onFilter={handleFilter} />
            <Grid container spacing={2}>
                {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.medication_id}>
                        <ProductCard
                            medication_id={product.medication_id}
                            name={product.name}
                            stock={product.stock}
                            price={product.price}
                            image={product.image}
                            onAddToCart={() => addToCart(product)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default HomePage;
