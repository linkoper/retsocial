const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/miniredsocial', { useNewUrlParser: true, useUnifiedTopology: true });

const postSchema = new mongoose.Schema({
    text: String,
    fileUrl: String,
    fileType: String
});

const Post = mongoose.model('Post', postSchema);

app.use(express.static('public'));

app.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts);
});

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('newPost', async (post) => {
        const newPost = new Post(post);
        await newPost.save();
        io.emit('newPost', newPost);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
