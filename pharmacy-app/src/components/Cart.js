import React from 'react';
import { Container, Typography, Button } from '@mui/material';

function Cart({ cart, placeOrder }) {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Корзина
            </Typography>
            {cart.length === 0 ? (
                <Typography>Корзина пуста</Typography>
            ) : (
                <ul>
                    {cart.map((item, index) => (
                        <li key={index}>
                            {item.name} - {item.price} руб.
                        </li>
                    ))}
                </ul>
            )}
            {cart.length > 0 && (
                <Button variant="contained" color="primary" onClick={placeOrder}>
                    Купить
                </Button>
            )}
        </Container>
    );
}

export default Cart;
