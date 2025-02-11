const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Configurar el tamaño del canvas
canvas.width = 640;
canvas.height = 480;

// Acceder a la cámara del usuario
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

// Inicializar MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Dibujar puntos de referencia de la mano
  if (results.multiHandLandmarks) {
    results.multiHandLandmarks.forEach((landmarks) => {
      landmarks.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    });
  }
});

// Procesar video frame por frame
const processVideo = async () => {
  await hands.send({ image: video });
  requestAnimationFrame(processVideo);
};

// Esperar a que el video cargue y empezar a procesar
video.addEventListener('loadeddata', () => {
  processVideo();
});
