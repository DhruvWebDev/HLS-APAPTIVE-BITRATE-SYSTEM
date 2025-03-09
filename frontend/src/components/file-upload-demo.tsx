import { useState } from "react"
import { Button } from "./ui/button"
import { FileUpload } from "./ui/file-upload"
import axios from "axios"

export default function FileUploadDemo() {
  const [videos, setVideos] = useState<File[]>([])

  const handleVideoUpload = (files: File[]) => {
    setVideos((prev) => [...prev, ...files])
    console.log("Videos uploaded:", files)
  }

  const uploadBulkVideo = async () => {
    //Appending to form data
    const formData = new FormData()
    videos.forEach((video:File[]) => {
      formData.append("videos", video)
    }
    )
    // Sending the form data to the server

    try {
      const {data} = await axios.post("http://localhost:3000/upload", videos, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("Response:", data)
    } catch (error) {
      console.error("Error uploading videos:", error)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Video Upload</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Upload multiple video files at once. Supported formats: MP4, MOV, AVI, MKV, WebM
        </p>

        <FileUpload onChange={handleVideoUpload} accept="video/*" multiple={true} />

        {videos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Uploaded Videos: {videos.length}</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total size: {(videos.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}
        <Button >Upload Bulk Video</Button>
      </div>
    </div>
  )
}

