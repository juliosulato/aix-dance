import { useRef, useState } from "react";
import { ActionIcon, Avatar, Menu } from "@mantine/core";
import { BsThreeDots } from "react-icons/bs";
import { BiUpload } from "react-icons/bi";

function AvatarUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

  };

  return (
    <div className="relative">
      <Avatar color="violet" size={80} radius="xl" src={avatarUrl}>
        {!avatarUrl && "A"}
      </Avatar>

      <div className="absolute -left-1 -bottom-2">
        <Menu position="right-start">
          <Menu.Target>
            <ActionIcon radius="md" size="md" aria-label="Menu">
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
      />
    </div>
  );
}

export default AvatarUpload;
