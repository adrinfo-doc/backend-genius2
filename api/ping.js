export default function handler(req, res) {
  console.log('Ping recebido, método:', req.method);
  res.status(200).json({ message: "pong" });
}
