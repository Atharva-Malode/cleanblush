import React, { useState, useEffect } from "react";
import NavButton from "../../components/btn";

function MouthOpening() {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [photoClicked, isPhotoClicked] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [length, setLength] = useState(null);

    useEffect(() => {
        const getAvailableCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setCameras(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedCamera(videoDevices[0].deviceId);
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        getAvailableCameras();
    }, []);

    const handleCameraChange = (event) => {
        setSelectedCamera(event.target.value);
    };

    const toggleStreaming = () => {
        if (streaming) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        } else {
            startStreaming();
        }
        setStreaming(!streaming);
    };

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCamera } });
            setMediaStream(stream);
        } catch (error) {
            console.error('Error starting streaming:', error);
        }
    };

    const capturePhoto = async () => {
        try {
            const track = mediaStream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);
            const photoBlob = await imageCapture.takePhoto();
            const photoUrl = URL.createObjectURL(photoBlob);
            setCapturedPhoto(photoUrl);
            isPhotoClicked(false);

            const pngFIle = new File([photoBlob], "captured_photo.png", {type: "image/png"});
            console.log(pngFIle);
            setSelectedImage(pngFIle);
        } catch (error) {
            console.error('Error capturing photo:', error);
        }
        if (streaming) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
    };

    const captureAgain = async () => {
        setCapturedPhoto(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCamera } });
            setMediaStream(stream);
        } catch (error) {
            console.error('Error starting streaming:', error);
        }
        isPhotoClicked(true);
    };

    const checkOpening = async () => {
        if (selectedImage){
            console.log(selectedImage);
            try{
                const formData = new FormData();
                formData.append('file', selectedImage);
                console.log(formData.get('file'));

                const response = await fetch("http://127.0.0.1:8000/opening", {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok){
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data);
                setGeneratedImage(data.generatedImage);
                setLength(data.opening);
            } catch (error){
                console.error('Error from Server:', error);
            }
        }
    }

    return (
        <div>
            <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">Mouth Opening</h1>

            <div className="mt-2 flex flex-row items-center">
                <h2 className="text-2xl font-medium text-gray-700 mr-2">Select Camera:</h2>
                <select
                    value={selectedCamera}
                    onChange={handleCameraChange}
                    className="bg-white border border-gray-700 rounded px-3 py-2 mt-2 text-gray-800"
                >
                    {cameras.map(camera => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                        </option>
                    ))}
                </select>
                {streaming ? (
                    photoClicked && (
                        <button onClick={capturePhoto} className="ml-2 mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Capture Photo
                        </button>
                    )
                ) : (
                    <button onClick={toggleStreaming} className="ml-2 mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Start Streaming
                    </button>
                )}
            </div>

            {/* Display the stream */}
            {mediaStream && (
                <div className="mt-4">
                    <video
                        autoPlay
                        playsInline
                        ref={videoRef => {
                            if (videoRef) {
                                videoRef.srcObject = mediaStream;
                            }
                        }}
                        className="w-full rounded-3xl shadow-2xl border border-gray-300"
                    />
                </div>
            )}

            {/* Display captured photo */}
            {capturedPhoto && (
                <div className="mt-4 flex space-x-4 items-center">
                    <img src={capturedPhoto} alt="Captured" className="w-full rounded-3xl shadow-2xl border border-gray-300" />
                    <div className="flex flex-col space-y-2 items-start">
                        <button onClick={captureAgain} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Capture Again</button>
                        <button onClick={checkOpening} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">Check Opening</button>
                    </div>
                </div>
            )}

            {generatedImage && (
                <div className="mt-6 flex space-x-4">
                    <img
                        src={`data:image/jpeg;base64,${generatedImage}`}
                        alt="Generated Image"
                        className="max-w-full rounded-3xl"
                    />
                    <div className="flex flex-col space-y-2"> 
                    <h1 className="font-serif text-4xl text-indigo-600 leading-tight">Results</h1>
                        <span className="text-xl font-bold">Mouth Opening: {length}</span>
                    </div>
                </div>
            )}

            <div className="justify-center gap-4 mt-4 grid grid-cols-2">
                <NavButton destination="/" text="Previous"/>
                <NavButton destination="/selection" text="Next"/>
            </div>
        </div>
    );
}

export default MouthOpening;