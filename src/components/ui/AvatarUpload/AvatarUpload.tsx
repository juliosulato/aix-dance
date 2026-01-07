import { Alert, FileButton, Menu } from "@mantine/core";
import { BiInfoCircle, BiUpload } from "react-icons/bi";
import { AvatarPreview } from "./AvatarPreview";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import CameraModal from "./CameraModal";
import { Control, FieldValues, useController, Path } from "react-hook-form";

type WithAvatarFile = {
  file?: File | null;
};

interface Props<T extends FieldValues & WithAvatarFile> {
  control: Control<T>;
  initialPreview?: string | null;
  firstName?: string;
}

export default function AvatarUpload<T extends FieldValues & WithAvatarFile>({
  control,
  initialPreview,
  firstName,
}: Props<T>) {
  const { field, fieldState } = useController<T>({
    name: "file" as Path<T>,
    control,
  });

  const { avatarPreview, handleFile } = useAvatarUpload(initialPreview);
  const { capture, openCamera, videoRef, closeCamera, opened } =
    useCameraCapture();

  const handleFileSelected = (file: File | null) => {
    if (!file) return;

    field.onChange(file);
    handleFile(file);
  };

  const handleCameraCapture = async () => {
    const file = await capture();
    if (!file) return;

    field.onChange(file);
    handleFile(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <FileButton name="file" onChange={handleFileSelected} accept="image/jpg, image/png, image/webp">
        {(fileButtonProps) => (
          <AvatarPreview
            src={avatarPreview}
            fallback={firstName || "A"}
            onOpenCamera={openCamera}
            uploadMenuItem={
              <Menu.Item {...fileButtonProps} leftSection={<BiUpload />}>
                Fazer Upload da Imagem
              </Menu.Item>
            }
          />
        )}
      </FileButton>

      <CameraModal
        closeCamera={closeCamera}
        isCameraOpen={opened}
        videoRef={videoRef}
        capturePhoto={handleCameraCapture}
      />

      {fieldState.error && (
        <Alert icon={<BiInfoCircle />} c="red">
          {fieldState.error.message}
        </Alert>
      )}
    </div>
  );
}
