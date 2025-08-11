# Camera Recorder Web App

A simple web application that allows users to record video using their device's camera.

## Features

- Camera permission handling
- Real-time camera preview (mirrored)
- Countdown before recording starts
- Video recording with audio
- Mobile-first responsive design

## How to Use

1. Open the `index.html` file using a web server (like Live Server VS Code extension)
2. Click "Enable Camera" to grant camera and microphone permissions
3. Once permissions are granted, click "Start Recording"
4. A 3-2-1 countdown will appear before recording begins
5. Click "Done" to stop recording and download the video file

## Notes

- This app works best in modern browsers (Chrome, Firefox, Edge, Safari)
- For security reasons, camera access requires HTTPS or localhost
- If using Live Server, the app will automatically reload on file changes
