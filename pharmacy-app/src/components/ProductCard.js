import React from 'react';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

function ProductCard({ name, description, price, image }) {
    return (
        <Card style={{ maxWidth: 300, margin: '10px' }}>
            <CardMedia
                component="img"
                height="140"
                image={image || 'https://via.placeholder.com/300'} // Заглушка для изображений
                alt={name}
            />
            <CardContent>
                <Typography variant="h5" component="div">
                    {name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
                <Typography variant="h6" color="text.primary">
                    ${price.toFixed(2)}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default ProductCard;