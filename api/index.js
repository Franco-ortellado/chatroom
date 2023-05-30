const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const ws = require('ws');
const fs = require('fs');

dotenv.config();
mongoose.connect(process.env.MONGO_URL);

const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);

app.get('/test', (req, res) => {
	res.json('Hello World');
});

app.use('/uploads', express.static(__dirname + '/uploads'));
app.get('/profile', (req, res) => {
	const token = req.cookies?.token;

	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
			if (err) throw err;
			res.json(userData);
		});
	} else {
		res.status(422).json('no token');
	}
});

app.post('/login', async (req, res) => {
	const {username, password} = req.body;

	console.log(process.env.JWT_SECRET);

	const foundUser = await User.findOne({username: username});

	if (foundUser) {
		const passOk = bcrypt.compareSync(password, foundUser.password);
		if (passOk) {
			jwt.sign(
				{userId: foundUser._id, username},
				process.env.JWT_SECRET,
				{},
				(err, token) => {
					res.cookie('token', token, {
						sameSite: 'none',
						secure: true,
					}).json({id: foundUser._id});
				}
			);
		}
	}
});

app.post('/logout', (req, res) => {
	res.cookie('token', '', {
		sameSite: 'none',
		secure: true,
	}).json('ok');
});

app.post('/register', async (req, res) => {
	const {username, password} = req.body;
	try {
		const hashPassword = bcrypt.hashSync(password, bcryptSalt);

		const createdUser = await User.create({
			username,
			password: hashPassword,
		});

		const token = jwt.sign(
			{userId: createdUser._id, username},
			process.env.JWT_SECRET
		);

		res.cookie('token', token, {sameSite: 'none', secure: true})
			.status(201)
			.json({id: createdUser._id});
	} catch (err) {
		console.error(err);
		res.status(500).json({message: 'Internal Server Error'});
	}
});

function getUserDataFromRequest(req) {
	return new Promise((resolve, reject) => {
		const token = req.cookies?.token;

		if (token) {
			jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
				if (err) throw err;
				resolve(userData);
			});
		} else {
			reject('no token');
		}
	});
}

app.get('/messages/:userId', async (req, res) => {
	const {userId} = req.params;

	const userData = await getUserDataFromRequest(req);
	const ourUserId = userData.userId;

	const messages = await Message.find({
		sender: {$in: [userId, ourUserId]},
		recipient: {$in: [userId, ourUserId]},
	}).sort({createdAt: 1});
	res.json(messages);
});

app.get('/people', async (req, res) => {
	const people = await User.find({}, {_id: 1, username: 1});
	res.json(people);
});

const server = app.listen(4040);

const wss = new ws.WebSocketServer({server});

wss.on('connection', (connection, req) => {
	// Enviar la lista de usuarios conectados a todos los clientes
	function notifyInlinePeople() {
		[...wss.clients].forEach((client) => {
			client.send(
				JSON.stringify({
					online: [...wss.clients].map((c) => ({
						userId: c.userId,
						username: c.username,
					})),
				})
			);
		});
	}

	connection.asAlive = true;

	connection.timer = setInterval(() => {
		connection.ping();

		connection.deathTimer = setTimeout(() => {
			connection.isAlive = false;
			clearInterval(connection.timer);
			connection.terminate();
			notifyInlinePeople();
			console.log('dead');
		}, 1000);
	}, 5000);

	connection.on('pong', () => {
		clearTimeout(connection.deathTimer);
	});

	// Obtener las cookies de la petición HTTP
	const cookies = req.headers.cookie;

	if (cookies) {
		// Convertir el string de cookies en un array de cookies
		const cookiesArray = cookies.split(';');

		// Buscar la cookie "token="
		const tokenstr = cookiesArray.find((str) =>
			str.trim().startsWith('token=')
		);

		if (tokenstr) {
			// Obtener el valor del token de la cookie
			const token = tokenstr.split('=')[1];

			// Si el token existe
			// Verificar el token usando el secreto JWT y obtener los datos de usuario
			if (token) {
				jwt.verify(
					token,
					process.env.JWT_SECRET,
					{},
					(err, userData) => {
						if (err) throw err;

						// Guardar los datos de usuario en la conexión del cliente
						const {userId, username} = userData;
						connection.userId = userId;
						connection.username = username;
					}
				);
			}
		}
	}

	connection.on('message', async (message) => {
		const messageObj = JSON.parse(message.toString());
		const {recipient, text, file} = messageObj.message;

		let fileName = null;

		// if (file) {
		// 	const parts = file.name.split('.');
		// 	const ext = parts[parts.length - 1];
		// 	fileName = Date.now() + '.' + ext;
		// 	const path = __dirname + '/uploads/' + fileName;

		// 	const bufferData = new Buffer(file.data.split(',')[1], 'base64');

		// 	fs.writeFile(path, bufferData, () => {
		// 		console.log('file saved: ' + path);
		// 	});
		// }

		if (recipient && (text || file)) {
			const messageDoc = await Message.create({
				sender: connection.userId,
				recipient,
				text,
				file: file ? fileName : null,
			});
			[...wss.clients]
				.filter((c) => c.userId === recipient)
				.forEach((c) =>
					c.send(
						JSON.stringify({
							text,
							sender: connection.userId,
							recipient,
							file: file ? fileName : null,
							_id: messageDoc._id,
						})
					)
				);
		}
	});

	notifyInlinePeople();
});
