import { notifications } from "@mantine/notifications";
import { useState } from "react";

export function useAvatarUpload(initialPreview: string | null | undefined) {
    const [avatarPreview, setAvatarPreview] = useState<string | null | undefined>(initialPreview);
    
    const handleFile = (file?: File) => {
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            notifications.show({
                color: "red",
                message: "O arquivo é muito grande (máx. 5MB)."
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    return {
        avatarPreview,
        handleFile
    }
}