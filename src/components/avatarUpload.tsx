import { useRef, useState } from "react";
import { ActionIcon, Avatar, Menu, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { BsThreeDots } from "react-icons/bs";
import { BiUpload } from "react-icons/bi";
import { useTranslations } from "next-intl";

type Props = {
  onUploadComplete: (url: string) => void;
}

function AvatarUpload({ onUploadComplete }: Props) {
  const t = useTranslations("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Validação básica do arquivo
    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
      notifications.show({ color: "red", message: "O arquivo é muito grande (máx 5MB)." });
      return;
    }

    setIsLoading(true);
    
    // Mostra a pré-visualização imediatamente
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // 2. Pedir a URL pré-assinada para o nosso backend
      const presignedUrlResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error("Falha ao obter URL para upload.");
      }
      
      const { uploadUrl, fileUrl } = await presignedUrlResponse.json();

      // 3. Fazer o upload do arquivo diretamente para a S3
      const uploadToS3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadToS3Response.ok) {
        throw new Error("Falha no upload para o S3.");
      }
      
      // 4. Sucesso! Notificar o componente pai com a URL final.
      onUploadComplete(fileUrl);
      notifications.show({ color: "green", message: "Avatar enviado com sucesso!" });

    } catch (error) {
      console.error(error);
      setAvatarPreview(null); // Limpa a preview em caso de erro
      notifications.show({ color: "red", message: "Ocorreu um erro no upload." });
    } finally {
      setIsLoading(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative">
      <Avatar color="violet" size={80} radius="xl" src={avatarPreview}>
        {!avatarPreview && "A"}
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
          </Menu.Dropdown>
        </Menu>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
    </div>
  );
}

export default AvatarUpload;