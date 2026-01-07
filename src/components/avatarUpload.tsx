// Depreciado

import { useRef, useState } from "react";
import { ActionIcon, Avatar, Menu, Loader, Modal, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { BsThreeDots } from "react-icons/bs";
import { BiUpload, BiCamera } from "react-icons/bi";
import { BsImageAlt } from "react-icons/bs";
import { useSession } from "@/lib/auth-client";

type Props = {
  defaultUrl?: string | null;
  onUploadComplete: (url: string) => void;
  folder?: string;
}

function AvatarUpload({ defaultUrl, onUploadComplete, folder = "avatars" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(defaultUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { data: session } = useSession();

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!session?.user?.tenancyId) {
      notifications.show({ color: "red", message: "Sessão inválida para upload." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifications.show({ color: "red", message: "O arquivo é muito grande (máx 5MB)." });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const presignedUrlResponse = await fetch('/api/upload', {
        method: "POST",
                credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, prefix: folder }),
      });

      if (!presignedUrlResponse.ok) throw new Error("Falha ao obter URL para upload.");

      const { uploadUrl, fileUrl } = await presignedUrlResponse.json();

      const uploadToS3Response = await fetch(uploadUrl, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          // Envia Content-Disposition conforme a assinatura do S3
          'Content-Disposition': `attachment; filename="${file.name}"`,
        },
        body: file,
      });

      if (!uploadToS3Response.ok) {
        // Loga o corpo da resposta para diagnóstico
        const errorText = await uploadToS3Response.text();
        console.error('S3 upload failed:', uploadToS3Response.status, errorText);
        throw new Error("Falha no upload para o S3.");
      }

      onUploadComplete(fileUrl);
      notifications.show({ color: "green", message: "Avatar enviado com sucesso!" });

    } catch (error) {
      console.error(error);
      setAvatarPreview(null);
      notifications.show({ color: "red", message: "Ocorreu um erro no upload." });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error(err);
      notifications.show({ color: "red", message: "Não foi possível acessar a câmera." });
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");


    // Converte para Blob para upload
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "camera-photo.png", { type: "image/png" });

    // Fecha a câmera
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsCameraOpen(false);

    // Reutiliza o mesmo fluxo de upload
    handleFileChange({ target: { files: [file] } } as any);
  };

  const closeCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsCameraOpen(false);
  };

  return (
    <div className="relative">
      <Avatar color="violet" size={80} radius="xl" src={avatarPreview}>
        {!avatarPreview && <BsImageAlt size={30} />}
      </Avatar>

      {isLoading && <Loader size="sm" pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}

      <div className="absolute -left-1 -bottom-2">
        <Menu position="right-start">
          <Menu.Target>
            <ActionIcon radius="md" size="md" aria-label="Menu" disabled={isLoading}>
              <BsThreeDots size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<BiUpload />} onClick={handleUploadClick}>
              Fazer Upload da Imagem
            </Menu.Item>
            <Menu.Item leftSection={<BiCamera />} onClick={openCamera}>
              Tirar Foto
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} disabled={isLoading} />

      <Modal opened={isCameraOpen} onClose={closeCamera} title="Tire sua foto">
        <video ref={videoRef} autoPlay style={{ width: "100%", borderRadius: 8 }} />
        <Button fullWidth mt="md" onClick={capturePhoto}>Capturar Foto</Button>
      </Modal>
    </div>
  );
}

export default AvatarUpload;
