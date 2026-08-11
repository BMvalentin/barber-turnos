export interface UploadSingleOptions {
  file: File;
  folder?: string;
  publicId?: string;
  transformation?: Record<string, string | number | boolean>[];
  context?: Record<string, string>;
  tags?: string[];
  resourceType?: "image" | "video" | "raw" | "auto";
  format?: string;
  overwrite?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  publicId?: string;
}
