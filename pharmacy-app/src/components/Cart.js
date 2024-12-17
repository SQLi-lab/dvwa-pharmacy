import React from 'react';
import { Container, Typography, Button, Paper, Box } from '@mui/material';

function Cart({ cart, placeOrder }) {
    return (
        <Container disableGutters style={{ marginTop: '20px', marginLeft: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Typography variant="h4" gutterBottom >
                Корзина
            </Typography>

            <Paper elevation={3} style={{ padding: '20px', width: '600px' }}>
                {cart.length === 0 ? (
                    <Typography style={{ fontSize: '1.2rem' }}>Корзина пуста</Typography>
                ) : (
                    <div>
                        {cart.map((item, index) => (
                            <Box
                                key={index}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    backgroundColor: index % 2 === 0 ? '#f7f7f7' : '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '1.2rem'
                                }}
                            >
                                <Typography style={{ fontWeight: 500, fontSize: '1.2rem' }}>
                                    {item.name}
                                </Typography>
                                <Typography style={{ marginLeft: '20px', fontSize: '1.2rem' }}>
                                    {item.price} руб.
                                </Typography>
                            </Box>
                        ))}
                    </div>
                )}
                {cart.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={placeOrder}
                        style={{ marginTop: '20px', fontSize: '1.1rem', padding: '10px 20px' }}
                    >
                        Купить
                    </Button>
                )}
            </Paper>
        </Container>
    );
}

export default Cart;
