"use client";

import React, { useRef, useState } from "react";
import { Button, Progress, Text, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export type UploadedFile = {
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
};

type Props = {
  accept?: string;
  multiple?: boolean;
  maxFileSizeBytes?: number;
  onComplete: (files: UploadedFile[]) => void;
  uploadPathPrefix?: string;
};

export default function FileUpload({
  accept,
  multiple = false,
  maxFileSizeBytes = 5 * 1024 * 1024, // default 5MB
  onComplete,
  uploadPathPrefix,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validated: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > maxFileSizeBytes) {
        notifications.show({ color: "red", message: `${f.name} excede o tamanho máximo (${Math.round(maxFileSizeBytes / 1024 / 1024)}MB).` });
        continue;
      }
      validated.push(f);
    }
    if (validated.length === 0) return;

    setIsUploading(true);
    const uploaded: UploadedFile[] = [];

    for (const file of validated) {
      try {
        const body = { filename: file.name, contentType: file.type, size: file.size, prefix: uploadPathPrefix };
        const presignedRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!presignedRes.ok) throw new Error("Erro ao obter URL de upload");
        const { uploadUrl, fileUrl } = await presignedRes.json();

        await uploadWithProgress(uploadUrl, file, (pct) => setProgressMap((s) => ({ ...s, [file.name]: Math.round(pct) })));

        uploaded.push({ fileUrl, originalName: file.name, mimeType: file.type, size: file.size });
      } catch (err) {
        console.error("upload failed", err);
        notifications.show({ color: "red", message: `Falha no upload de ${file.name}` });
      }
    }

    setIsUploading(false);
    setProgressMap({});
    if (uploaded.length > 0) onComplete(uploaded);
  };

  const uploadWithProgress = (uploadUrl: string, file: File, onProgress: (pct: number) => void) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          onProgress((ev.loaded / ev.total) * 100);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload falhou com status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(file);
    });

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={(e) => handleFiles(e.target.files)} style={{ display: "none" }} />
      <Group>
        <Button onClick={() => inputRef.current?.click()} disabled={isUploading}>
          Selecionar arquivo{multiple ? "s" : ""}
        </Button>
        {isUploading && <Text size="sm">Enviando...</Text>}
      </Group>

      <div style={{ marginTop: 12 }}>
        {Object.keys(progressMap).map((name) => (
          <div key={name} style={{ marginBottom: 8 }}>
            <Text size="sm">{name}</Text>
            <Progress value={progressMap[name]} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
