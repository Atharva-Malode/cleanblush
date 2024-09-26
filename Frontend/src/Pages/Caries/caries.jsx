import React, { useState, useEffect } from "react";
import NavButton from "../../components/btn";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function Caries({ onPredictionChange }) {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [photoClicked, isPhotoClicked] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [predictedClass, setPredictedClass] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const [openCrop, isOpenCrop] = useState(false);
    const [crop, setCrop] = useState(null);
    const [uploadMode, setUploadMode] = useState(false);

    useEffect(() => {
        console.log("Prediction state:", predictedClass);
        onPredictionChange(predictedClass)
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

            const pngFile = new File([photoBlob], "captured_photo.png", { type: "image/png" });
            console.log(pngFile);
            setSelectedImage(pngFile);
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

    const checkCalculus = async () => {
        if (selectedImage) {
            console.log(selectedImage);
            try {
                const formData = new FormData();
                formData.append('file', selectedImage);
                console.log(formData.get('file'));

                // const response = await fetch("http://127.0.0.1:8000/calculus", {
                const response = await fetch("http://192.168.197.230:8000/caries", {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data);
                setGeneratedImage(data.generatedImage);
                setPredictedClass(data.class);
                setConfidence(data.conf);
            } catch (error) {
                console.error('Error from Server:', error);
            }
        }
    };

    const cropPhoto = () => {
        isOpenCrop(!openCrop);
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
            isOpenCrop(false);

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
            <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">Caries Prediction</h1>

            <div className="mt-2 flex items-center">
                <h2 className="text-2xl font-medium text-gray-700 mr-2">Select Camera:</h2>
                <select
                    value={selectedCamera}
                    onChange={handleCameraChange}
                    className="bg-white border border-gray-700 rounded px-3 py-2 mt-2 text-gray-800"
                    disabled={uploadMode}
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
                    !uploadMode && (
                        <button onClick={toggleStreaming} className="ml-2 mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Start Streaming
                        </button>
                    )
                )}
                <button onClick={toggleUploadMode} className="ml-2 mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                    {uploadMode ? "Use Camera" : "Upload Image"}
                </button>
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
                        ref={videoRef => {
                            if (videoRef) {
                                videoRef.srcObject = mediaStream;
                            }
                        }}
                        className="w-full rounded-3xl shadow-2xl border border-gray-300"
                    />
                </div>
            )}

            {capturedPhoto && (
                <div className="mt-4 flex space-x-4 items-center">
                    <img src={capturedPhoto} alt="Captured" className="w-full rounded-3xl shadow-2xl border border-gray-300" />
                    <div className="flex flex-col space-y-2 items-start">
                        <button onClick={captureAgain} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Capture Again</button>
                        <button onClick={cropPhoto} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Crop Image</button>
                        <button onClick={checkCalculus} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">Check Calculus</button>
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
                <div className="mt-6 flex space-x-4">
                    <img
                        src={`data:image/jpeg;base64,${generatedImage}`}
                        alt="Generated Image"
                        className="max-w-full rounded-3xl"
                    />
                    <div className="flex flex-col space-y-2">
                        <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">Results</h1>
                        <span className="text-xl text-gray-700">{predictedClass}: {confidence}</span>
                    </div>
                </div>
            )}

            <div className="justify-center gap-4 mt-4 grid grid-cols-2">
                <NavButton text="Previous" destination="/selection" />
                <NavButton text="Next" destination="/caries" />
            </div>
        </div>
    );
}

export default Caries;
