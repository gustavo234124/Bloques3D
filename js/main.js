const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const block = document.getElementById('block');

// Función para ajustar el tamaño del canvas al tamaño del video
const adjustCanvasSize = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
};

// Acceder a la cámara del usuario
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', adjustCanvasSize);
});

// Inicializar MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2, // Permitir ambas manos
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks) {
    results.multiHandLandmarks.forEach((landmarks, index) => {
      // Usamos la palma (punto 9) en lugar de la muñeca para más precisión
      const palm = landmarks[9];

      // Convertimos coordenadas de 0-1 a píxeles reales
      const x = palm.x * canvas.width;
      const y = palm.y * canvas.height;

      if (index === 0) {
        block.style.transform = `translate(${x}px, ${y}px)`;
      }

      // Dibujar puntos de referencia
      landmarks.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    });
  }
});

// aqui proceso  video frame por frame
const processVideo = async () => {
  await hands.send({ image: video });
  requestAnimationFrame(processVideo);
};

// se espera que el  video cargue y empezar a procesar
video.addEventListener('loadeddata', () => {
  adjustCanvasSize();
  processVideo();
});

// Ajustar el tamaño del canvas cuando la ventana se redimensiona
window.addEventListener('resize', adjustCanvasSize);