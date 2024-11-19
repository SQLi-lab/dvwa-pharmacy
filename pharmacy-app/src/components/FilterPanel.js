import React from 'react';
import { Button, Box } from '@mui/material';

function FilterPanel({ categories, onFilter }) {
    return (
        <Box style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {categories.map((category) => (
                <Button
                    key={category}
                    variant="contained"
                    onClick={() => onFilter(category)}
                >
                    {category}
                </Button>
            ))}
        </Box>
    );
}

export default FilterPanel;
