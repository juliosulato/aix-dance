import { useRef, useState } from "react";

export function useCameraCapture() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [opened, setOpened] = useState<boolean>(false);

    const openCamera = async () => {
        setOpened(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
    };

    const closeCamera = () => {
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
        setOpened(false);
    }

    const capture = async (): Promise<File | null> => {
        if (!videoRef.current) return null;

        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        const ctx = canvas.getContext("2d")
        ctx?.drawImage(videoRef.current, 0, 0);

        const blob = await (await fetch(canvas.toDataURL("image/png"))).blob();
        closeCamera();

        return new File([blob], "camera-photo.png", { type: "image/png" })
    }

    return {
        videoRef,
        opened,
        openCamera,
        closeCamera,
        capture
    }
}