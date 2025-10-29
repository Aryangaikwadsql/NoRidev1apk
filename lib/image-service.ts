// Image processing and validation
export interface ImageValidation {
  isValid: boolean
  size: number
  format: string
  isDuplicate: boolean
  isStockImage: boolean
  hasVehicleNumber: boolean
}

export async function validateImage(file: File): Promise<ImageValidation> {
  const validFormats = ["image/jpeg", "image/png", "image/webp"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  const isValid = validFormats.includes(file.type) && file.size <= maxSize

  // Basic duplicate detection using image hash (simplified)
  const hash = await generateImageHash(file)
  const isDuplicate = false // In production, check against database of recent hashes

  // Basic stock image detection (simplified - would use TensorFlow.js)
  const isStockImage = false // In production, use ML model to detect stock/generic images

  // Basic OCR for vehicle number detection (simplified)
  const hasVehicleNumber = false // In production, use Tesseract.js or similar

  return {
    isValid,
    size: file.size,
    format: file.type,
    isDuplicate,
    isStockImage,
    hasVehicleNumber,
  }
}

export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        // Calculate new dimensions (max 1200px)
        let width = img.width
        let height = img.height
        const maxDim = 1200

        if (width > height) {
          if (width > maxDim) {
            height = (height * maxDim) / width
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = (width * maxDim) / height
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(blob || file)
          },
          "image/jpeg",
          0.8,
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function generateImageHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = e.target?.result as ArrayBuffer
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      resolve(hashHex)
    }
    reader.readAsArrayBuffer(file)
  })
}
