
import React, { useState, useEffect, useRef } from "react";
import NavButton from "../../components/btn";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function Osmf({ onPredictionChange }) {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [photoClicked, setPhotoClicked] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [predictedClass, setPredictedClass] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const [openCrop, setOpenCrop] = useState(false);
    const [crop, setCrop] = useState(null);
    const [uploadMode, setUploadMode] = useState(false);
    const [openDou, setOpenDou] = useState(false);

    const videoRef = useRef(null);

    useEffect(() => {
        console.log("Prediction state:", predictedClass);
        onPredictionChange(predictedClass);
    }, [predictedClass, onPredictionChange]);

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

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [mediaStream]);

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
            if (mediaStream) {
                const track = mediaStream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(track);
                const photoBlob = await imageCapture.takePhoto();
                const photoUrl = URL.createObjectURL(photoBlob);
                setCapturedPhoto(photoUrl);
                setPhotoClicked(false);

                const pngFile = new File([photoBlob], "captured_photo.png", { type: "image/png" });
                setSelectedImage(pngFile);
            } else {
                console.error("No media stream available for capturing photo.");
            }
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
        setPhotoClicked(true);
    };

    const checkCalculus = async () => {
        if (selectedImage) {
            try {
                const formData = new FormData();
                formData.append('file', selectedImage);

                const response = await fetch("http://127.0.0.1:8000/osmf", {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setGeneratedImage(data.generatedImage);
                setPredictedClass(data.class);
                setConfidence(data.conf);
            } catch (error) {
                console.error('Error from Server:', error);
            }
        }
    };

    const cropPhoto = () => {
        setOpenCrop(!openCrop);
    };

    const saveCroppedImage = () => {
        const image = new Image();
        image.src = capturedPhoto;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        canvas.toBlob(blob => {
            const croppedUrl = URL.createObjectURL(blob);
            setCapturedPhoto(croppedUrl);
            setOpenCrop(false);

            const croppedFile = new File([blob], "cropped_photo.png", { type: "image/png" });
            setSelectedImage(croppedFile);
        }, 'image/png');
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setCapturedPhoto(fileUrl);
            setSelectedImage(file);
            setStreaming(false);
        }
    };

    const toggleUploadMode = () => {
        setUploadMode(!uploadMode);
        setStreaming(false);
        setCapturedPhoto(null);
        setSelectedImage(null);
    };

    return (
        <div>
            <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">OSMF Prediction</h1>

            <div className="mt-2 flex flex-col md:flex-row md:items-center">
                <h2 className="text-2xl font-medium text-gray-700 mr-2">Select Camera:</h2>
                <select
                    value={selectedCamera}
                    onChange={handleCameraChange}
                    className="bg-white border border-gray-700 rounded px-3 py-2 mt-2 text-gray-800 md:mt-0"
                >
                    {cameras.map(camera => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                        </option>
                    ))}
                </select>
                <div className="mt-4 md:mt-0 md:ml-4 flex flex-col md:flex-row gap-2">
                    <button onClick={toggleStreaming} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        {streaming ? "Stop Streaming" : "Start Streaming"}
                    </button>
                    <button onClick={capturePhoto} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Capture Photo</button>
                    <button onClick={toggleUploadMode} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                        Upload Image
                    </button>
                    <button onClick={() => setOpenDou(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Directions of Use
                    </button>
                </div>
            </div>

            {uploadMode && (
                <div className="mt-4">
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
            )}

            {mediaStream && (
                <div className="mt-4">
                    <video
                        autoPlay
                        playsInline
                        ref={videoRef}
                        className="w-full h-auto rounded-3xl shadow-2xl border border-gray-300"
                    />
                </div>
            )}

            {capturedPhoto && (
                <div className="mt-4 flex space-x-4 items-center w-1/4 h-1/4">
                    <img src={capturedPhoto} alt="Captured" className="w-full h-auto rounded-3xl shadow-2xl border border-gray-300" />
                    <div className="flex flex-col space-y-2 items-start">
                        <button onClick={captureAgain} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Capture Again</button>
                        <button onClick={cropPhoto} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Crop Image</button>
                        <button onClick={checkCalculus} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">Check OSMF</button>
                    </div>
                </div>
            )}

            {capturedPhoto && openCrop && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded-3xl shadow-lg">
                        <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                            <img src={capturedPhoto} alt="Crop" />
                        </ReactCrop>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button onClick={cropPhoto} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                            <button onClick={saveCroppedImage} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {generatedImage && (
                <div className="mt-6 flex space-x-4 w-1/4 h-1/4">
                    <img
                        src={`data:image/jpeg;base64,${generatedImage}`}
                        alt="Generated Image"
                        className="w-full h-auto rounded-3xl"
                    />
                    <div className="flex flex-col space-y-2">
                        <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">Results</h1>
                        <span className="text-xl text-gray-700">{predictedClass}: {confidence}</span>
                    </div>
                </div>
            )}

            <div className="justify-center gap-4 mt-4 grid grid-cols-2">
                <NavButton text="Previous" destination="/selection" />
                <NavButton text="Next" destination="/gingivitis" />
            </div>

            {openDou && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg max-w-lg">
                        <h2 className="text-2xl font-bold text-indigo-600 mb-4">Directions of Use</h2>
                        <p className="text-gray-700 mb-4 text-left">
                            <strong>To capture an image using the camera:</strong>
                            <ul className="list-disc ml-4">
                                <li>Select the appropriate camera from the dropdown menu.</li>
                                <li>Click "Start Streaming" to begin the camera stream.</li>
                                <li>Click "Capture Photo" to take a picture of your intraoral cheeks.</li>
                            </ul>
                            <br />
                            <strong>To upload an image:</strong>
                            <ul className="list-disc ml-4">
                                <li>Click "Upload Image" to open the file selector.</li>
                                <li>Choose an image that focuses only on the intraoral cheeks.</li>
                            </ul>
                        </p>
                        <button onClick={() => setOpenDou(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Osmf;