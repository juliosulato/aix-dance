import { Avatar, Button, FileButton, Text } from "@mantine/core";
import { Control, useController } from "react-hook-form";
import { BiEdit } from "react-icons/bi";
import { CreateStudentInput } from "@/schemas/academic/student.schema";

interface StudentAvatarUploadProps {
  control: Control<CreateStudentInput>;
  preview: string | null;
  firstName?: string;
  isUpdate?: boolean;
}

export default function StudentAvatarUpload({
  control,
  preview,
  firstName,
  isUpdate,
}: StudentAvatarUploadProps) {
  const { field, fieldState } = useController({
    name: "file",
    control,
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar
        src={preview}
        size={120}
        radius={120}
        className="border-2 border-violet-100"
      >
        {!preview && (firstName?.[0] || "A")}
      </Avatar>

      <FileButton
        onChange={field.onChange}
        accept="image/png,image/jpeg,image/webp"
      >
        {(props) => (
          <Button
            {...props}
            variant="light"
            color="violet"
            size="xs"
            leftSection={<BiEdit />}
          >
            {isUpdate ? "Alterar foto" : "Adicionar foto"}
          </Button>
        )}
      </FileButton>
      
      {fieldState.error && (
        <Text c="red" size="xs">
          {fieldState.error.message}
        </Text>
      )}
    </div>
  );
}