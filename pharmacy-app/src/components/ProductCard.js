import React from 'react';
import { Card, CardContent, Typography, CardMedia, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';



function ProductCard({ id, name, description, price, image }) {
    return (
        <Card style={{ maxWidth: 300, margin: '10px' }}>
            <CardActionArea component={Link} to={`/products/${id}`}>
                <CardMedia
                    component="img"
                    height="140"
                    image={image || 'https://via.placeholder.com/300'}
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
                        {price} руб.
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default ProductCard;
