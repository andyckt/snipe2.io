document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const cameraPreview = document.getElementById('camera-preview');
    const permissionBtn = document.getElementById('permission-btn');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const permissionMessage = document.getElementById('permission-message');
    const countdown = document.getElementById('countdown');
    
    // Global variables
    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let hasPermission = false;
    
    // Event listeners
    permissionBtn.addEventListener('click', requestPermissions);
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    
    // Check if permissions are already granted
    checkPermissions();
    
    // Functions
    async function checkPermissions() {
        try {
            // Check if permissions are already granted
            const result = await navigator.permissions.query({ name: 'camera' });
            if (result.state === 'granted') {
                await setupCamera();
            }
        } catch (error) {
            console.log('Permissions API not supported, will request directly');
        }
    }
    
    async function requestPermissions() {
        try {
            await setupCamera();
        } catch (error) {
            console.error('Error accessing camera:', error);
            permissionMessage.textContent = 'Camera access denied. Please enable permissions in your browser settings.';
            permissionMessage.style.color = '#f72585';
        }
    }
    
    async function setupCamera() {
        try {
            // Request access to camera and microphone with fullscreen vertical mode
            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1080 },
                    height: { ideal: 1920 },
                    aspectRatio: { ideal: 9/16 }
                },
                audio: true
            };
            
            // Try to get the exact constraints for better fullscreen experience
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (error) {
                console.log('Could not get exact constraints, trying with defaults');
                // Fallback to more flexible constraints
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            }
            
            // Connect the stream to the video element
            cameraPreview.srcObject = stream;
            
            // Update UI
            hasPermission = true;
            permissionBtn.style.display = 'none';
            startBtn.disabled = false;
            permissionMessage.style.display = 'none';
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }
    
    async function startRecording() {
        // Check if we have permission
        if (!hasPermission) {
            await requestPermissions();
            return;
        }
        
        // Start countdown
        startBtn.disabled = true;
        await runCountdown();
        
        // Setup media recorder
        recordedChunks = [];
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        
        try {
            mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.error('MediaRecorder error:', e);
            
            // Try with a different MIME type
            try {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            } catch (e2) {
                console.error('MediaRecorder fallback error:', e2);
                alert('Recording not supported in this browser');
                startBtn.disabled = false;
                return;
            }
        }
        
        // MediaRecorder event handlers
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            // Create a blob from the recorded chunks
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            
            // Create a download link for the recorded video
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recording.webm';
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            // Reset UI
            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            startBtn.disabled = false;
        };
        
        // Start recording
        mediaRecorder.start(1000); // Collect data in 1-second chunks
        
        // Update UI
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        stopBtn.disabled = false;
    }
    
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            stopBtn.disabled = true;
        }
    }
    
    async function runCountdown() {
        countdown.style.display = 'block';
        
        // Countdown from 3 to 1
        for (let i = 3; i >= 1; i--) {
            countdown.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        countdown.style.display = 'none';
    }
});
