import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import Router from "./routers/index.js";
import cors from "cors"
import morgan from 'morgan';
import dotenv from "dotenv"
import Connectdb from "./config/ConnectDB.js";
import 	Bill from "./models/bill.js";

// config
dotenv.config()
const app = express();
const server = createServer(app);
const io = new Server(server);

// middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

//router
app.use("/api", Router);

// connect to db
Connectdb()

// Lắng nghe kết nối từ client
io.on('connection', (socket) => {
	console.log('Client connected');
  
	// Gửi danh sách đơn hàng đến client khi kết nối được thiết lập
	Bill.find()
	  .then((orders) => socket.emit('orders', orders))
	  .catch((err) => console.log(err));
  
	// Lắng nghe sự kiện tạo đơn hàng từ client và gửi lại cho tất cả các client khác
	socket.on('createOrder', (order) => {
	  const newOrder = new Bill(order);
	  newOrder.save()
		.then(() => {
		  io.emit('newOrder', newOrder);
		})
		.catch((err) => console.log(err));
	});
});

server.listen(process.env.PORT, () => {
	console.log('server running port 8080');
});