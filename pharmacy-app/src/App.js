import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import HomePage from './components/HomePage'; // Главная страница
import LoginPage from './components/LoginPage'; // Страница логина
import ProfilePage from './components/ProfilePage'; // Личный кабинет
import Cart from './components/Cart'; // Корзина
import ProductDetail from './components/ProductDetail'; // Детальная страница товара
import BACKEND_URL from './components/Constants';

import './App.css';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${BACKEND_URL}`;

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

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    // Загружаем статус авторизации и корзину из localStorage при монтировании
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('loggedIn');
        if (isLoggedIn === 'true') {
            setLoggedIn(true);
        }

        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Сохраняем корзину в localStorage при каждом её изменении
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart]);


    const handleLogout = async () => {
        try {
            await axios.post('/logout', {});
            setLoggedIn(false);
            localStorage.setItem('loggedIn', 'false');
            navigate('/login');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const handleLogin = () => {
        setLoggedIn(true);
        localStorage.setItem('loggedIn', 'true');
    };

    // Добавление товара в корзину
    const addToCart = (product) => {
        setCart((prevCart) => [...prevCart, product]);
    };

    const clearCart = () => {
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
    };

    // Оформление заказа
    const placeOrder = () => {
        const userCookie = getCookieByName('user');

        if (!userCookie) {
            alert('Пользователь не авторизован!');
            return;
        }

        if (cart.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        const ordersToPlace = cart.map((item) => ({
            name: item.name,
            price: item.price,
        }));

        fetch(`${BACKEND_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userCookie,
            },
            body: JSON.stringify({ orders: ordersToPlace }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Ошибка при оформлении заказа');
                }
                return response.json();
            })
            .then(() => {
                setOrders((prevOrders) => [...prevOrders, ...cart]);
                setCart([]); // Очищаем корзину
                alert('Заказы успешно оформлены!');
            })
            .catch((error) => {
                console.error(error);
                alert('Ошибка при оформлении заказа.');
            });
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        style={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Аптека нового поколения
                    </Typography>
                    {loggedIn ? (
                        <>
                            <Button color="inherit" component={Link} to="/profile">
                                Личный кабинет
                            </Button>
                            <Button color="inherit" component={Link} to="/cart">
                                Корзина ({cart.length})
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <Button color="inherit" component={Link} to={`/login`}>
                            Войти
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Container style={{ marginTop: '20px' }}>
                <Routes>
                    <Route path="/" element={<HomePage addToCart={addToCart} />} />
                    <Route path="/login" element={<LoginPage setLoggedIn={handleLogin} />} />
                    <Route path="/profile" element={<ProfilePage orders={orders} />} />
                    <Route path="/cart" element={<Cart cart={cart} placeOrder={placeOrder} clearCart={clearCart} />} />
                    <Route path="/products/:medication_id" element={<ProductDetail addToCart={addToCart} />} />
                </Routes>

            </Container>
        </>
    );
}

export default App;
