
interface KeepAlive {
  action: string;
}


interface Subscription {
  action: string;
  topic: string;
  options?: {
    [key: string]: any;
  }
}

const wsUrl = `ws://192.168.1.70:7078`;
const socket = new WebSocket(wsUrl);

socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server');
    socket.send(JSON.stringify({
        action: "subscribe",
        topic: "confirmation"
    } as Subscription));
});

socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

socket.addEventListener('message', (event) => {
    console.log('Received message:', event.data);
});

// setTimeout(() => {
//   console.log("Closing socket");
//   socket.close();
// }, 30e3);

