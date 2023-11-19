import { Server } from 'socket.io';
import { createBill } from '../controllers/bill.js';
import { getAllBill } from '../controllers/bill.js';
import Bill from '../models/bill.js';

export const realTimeSocketIo = (server) => {
  // Tạo một Socket.IO instance và đính kèm nó vào server của bạn.
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

    // Khi một client kết nối tới server qua Socket.IO, sự kiện 'connection' sẽ được phát ra.
    io.on('connection', (socket) => {
      console.log(`Socket ${socket.id} has connected`);

      // Sự kiện 'getBills' được phát ra khi client muốn lấy danh sách hóa đơn.
      socket.on('getBills', async () => {
        try {
          const bill = await Bill.find();
          if (bill.length === 0) {
            return socket.emit('bills', {
              message: "Không có đơn hàng nào",
              data: [],
            });
          }
          return socket.emit('bills', {
            message: "thành công",
            data: bill,
          });
        } catch (error) {
          return socket.emit('bills', {
            message: error.message,
            data: [],
          });
        }
      });

      // Sự kiện 'addBill' được phát ra khi client muốn thêm một hóa đơn mới.
      socket.on('addBill', async (bill) => {
        try {
          // Gọi hàm createBill để thêm một hóa đơn mới vào database.
          const newBill = await createBill(bill);
          if (newBill) {
            // Nếu thêm hóa đơn thành công, gửi lại danh sách hóa đơn mới cho tất cả các client đang kết nối tới Socket.IO.
            const bills = await getAllBill();
            io.emit('bills', {
              message: "thành công",
              data: bills,
            });
          }
        } catch (error) {
          console.log(error);
        }
      });

      // Sự kiện 'disconnect' được phát ra khi client ngắt kết nối với server qua Socket.IO.
      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} has disconnected`);
      });
    });
};