"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

let uploads = 0;
const listeners = new Set<() => void>();

function setUploading(active: boolean) {
  uploads = Math.max(0, uploads + (active ? 1 : -1));
  listeners.forEach((listener) => listener());
}

export function useResumeUploading() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => uploads > 0,
    () => false,
  );
}

export function useUploadResume() {
  const [isPending, setIsPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const rememberFile = (file: File) => {
    const next = URL.createObjectURL(file);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next;
    setPreviewUrl(next);
  };

  const deleteResume = async (key: string) => {
    setIsPending(true);
    setUploading(true);
    try {
      const response = await fetch("/api/upload/resume", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!response.ok) throw new Error("Failed to delete resume");
      setPreviewUrl(null);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
      toast.success(
        "Resume removed from this form. Save your application to keep this change.",
      );
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete resume");
      return false;
    } finally {
      setIsPending(false);
      setUploading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    onChange: (url: string) => void,
    replaceKey?: string,
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Invalid file type. Please upload a PDF file.");
      return;
    }

    setIsPending(true);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (replaceKey) formData.append("replaceKey", replaceKey);

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload file");

      const { data } = await response.json();
      rememberFile(file);
      onChange(data.key);
      toast.success("Resume uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsPending(false);
      setUploading(false);
    }
  };

  return {
    handleFileUpload,
    deleteResume,
    previewUrl,
    isPending,
  };
}
