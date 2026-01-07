import { Button, Modal } from "@mantine/core";
import { Ref } from "react";

type Props = {
    isCameraOpen: boolean;
    closeCamera: () => void;
    videoRef: Ref<HTMLVideoElement | null>
    capturePhoto: () => void;
}
export default function CameraModal({ closeCamera, isCameraOpen, videoRef, capturePhoto }: Props) {
  return (
    <Modal opened={isCameraOpen} onClose={closeCamera} title="Tire sua foto">
      <video
        ref={videoRef}
        autoPlay
        style={{ width: "100%", borderRadius: 8 }}
      />
      <Button fullWidth mt="md" onClick={capturePhoto}>
        Capturar Foto
      </Button>
    </Modal>
  );
}
