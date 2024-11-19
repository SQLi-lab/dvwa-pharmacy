import React, { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import FilterPanel from './components/FilterPanel';
import { Button } from '@mui/material';
import { AppBar, Toolbar, Typography, Container, Grid } from '@mui/material';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Загружаем продукты и категории
    axios.get('http://127.0.0.1:5000/products').then((response) => {
      setProducts(response.data);
      setFilteredProducts(response.data);

      // Генерация категорий из данных (пример: "Pain Relief", "Vitamins")
      const uniqueCategories = [
        ...new Set(response.data.map((product) => product.category || 'Other')),
      ];
      setCategories(uniqueCategories);
    });
  }, []);

  const handleFilter = (category) => {
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
          products.filter((product) => product.category === category)
      );
    }
  };

  return (
      <div>
        {/* Верхняя панель */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Pharmacy App
            </Typography>
            <Button color="inherit">Личный кабинет</Button>
          </Toolbar>
        </AppBar>

        {/* Основной контент */}
        <Container style={{ marginTop: '20px' }}>
          {/* Фильтры */}
          <FilterPanel
              categories={['All', ...categories]}
              onFilter={handleFilter}
          />

          {/* Карточки товаров */}
          <Grid container spacing={2}>
            {filteredProducts.map((product) => (
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
      </div>
  );
}

export default App;
