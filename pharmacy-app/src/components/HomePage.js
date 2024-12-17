import React, { useState, useEffect } from 'react';
import { Grid, Container, Typography, Box, Button } from '@mui/material';
import ProductCard from './ProductCard';
import axios from 'axios';
import images from './imagesLoader';

function HomePage({ addToCart }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAllCategories, setShowAllCategories] = useState(false);

    useEffect(() => {
        axios.get('/products')
            .then((response) => {
                const data = response.data;

                const productsWithImages = data.map((product, index) => ({
                    ...product,
                    image: images[index % images.length],
                }));

                setProducts(productsWithImages);
                setFilteredProducts(productsWithImages);

                const uniqueCategories = [...new Set(productsWithImages.map((product) => product.category || 'Другое'))];
                setCategories(uniqueCategories);
            })
            .catch((error) => {
                console.error('Ошибка загрузки товаров:', error);
            });
    }, []);

    const handleFilter = (category) => {
        setSelectedCategory(category);
        if (!category) {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter((product) => product.category === category));
        }
    };

    const visibleCategories = showAllCategories ? categories : categories.slice(0, 3);

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Список товаров
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '20px',
                    alignItems: 'flex-start' // Чтобы высокие кнопки не растягивали остальные по высоте
                }}
            >
                <Button
                    variant={selectedCategory ? "outlined" : "contained"}
                    color="primary"
                    onClick={() => handleFilter(null)}
                    sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                >
                    Без фильтра
                </Button>

                {visibleCategories.map((category, index) => (
                    <Button
                        key={index}
                        variant={selectedCategory === category ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => handleFilter(category)}
                        sx={{
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                        }}
                    >
                        {category}
                    </Button>
                ))}
            </Box>

            {categories.length > 3 && (
                <Button
                    variant="outlined"
                    style={{ marginBottom: '20px' }}
                    onClick={() => setShowAllCategories((prev) => !prev)}
                >
                    {showAllCategories ? 'Скрыть категории' : 'Показать все категории'}
                </Button>
            )}

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
