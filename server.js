const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express')
const axios = require('axios')
const app = express()
const port = process.env.PORT || 3000

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('Current directory:', __dirname);
console.log('PORT:', process.env.PORT);
console.log('NEWS_API_KEY exists:', !!process.env.NEWS_API_KEY);
console.log('NEWS_API_KEY length:', process.env.NEWS_API_KEY ? process.env.NEWS_API_KEY.length : 0);

// Middleware
app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname) } )
})

app.get('/api', async(req, res) => {
    try {
        // Temporary: Use hardcoded API key until we fix environment variables
        const apiKey = process.env.NEWS_API_KEY || '90501f4112d14afa937413adcde448a3';
        console.log('API Key check:', apiKey ? 'Present' : 'Missing');
        
        if (!apiKey) {
            console.log('API key not found in environment variables');
            return res.status(500).json({ error: 'API key not configured' });
        }
        
        // Build query string properly
        const queryParams = new URLSearchParams(req.query).toString();
        let url = "https://newsapi.org/v2/everything?" + queryParams + "&apiKey=" + apiKey;
        console.log('Making request to News API...');
        console.log('Request URL:', url);
        
        let response = await axios.get(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers['content-type']);
        
        // Check if response is JSON
        if (response.headers['content-type'] && !response.headers['content-type'].includes('application/json')) {
            console.log('Warning: Response is not JSON, content-type:', response.headers['content-type']);
            console.log('Response preview:', response.data.substring(0, 200));
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        
        if (error.response?.data) {
            res.status(error.response.status || 500).json({ 
                error: 'Failed to fetch news',
                message: error.response.data.message || error.response.data || error.message 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to fetch news',
                message: error.message 
            });
        }
    }
})

app.listen(port, () => {
  console.log(`News app listening on port ${port}`)
})