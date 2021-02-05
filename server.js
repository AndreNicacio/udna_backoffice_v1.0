const express = require ('express');
const { request } = require('express');

const app = express();

app.use(express.json());

app.get('/',(request,response) =>{
    return response.json({message:'Server is up'});
})

app.post('/login.html')
