import UploadedFile from "@domain/entities/file.js"

export default interface FileUploaderServiceSharedMethods {
  deleteFile: (key: UploadedFile['key']) => Promise<void>
}
