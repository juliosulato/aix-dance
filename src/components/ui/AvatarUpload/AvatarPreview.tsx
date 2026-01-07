import { ActionIcon, Avatar, Button, FileButton, Menu } from "@mantine/core";
import { BiCamera, BiEdit, BiUpload } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";

interface Props {
  src?: string | null;
  fallback: string;
  onOpenCamera: () => void;
  uploadMenuItem: React.ReactNode;
}

export const AvatarPreview = ({ src, fallback, onOpenCamera, uploadMenuItem }: Props) => {
  return (
    <div className="relative">
      <Avatar
        src={src}
        size={120}
        radius={120}
        className="border-2 border-violet-100"
      >
        {!src && (fallback || "A")}
      </Avatar>
      <div className="absolute -left-1 -bottom-2">
        <Menu position="right-start">
          <Menu.Target>
            <ActionIcon radius="md" size="md" aria-label="Menu">
              <BsThreeDots size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
             {uploadMenuItem}

            <Menu.Item leftSection={<BiCamera />} onClick={onOpenCamera}>
              Tirar Foto
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
};
