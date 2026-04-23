const storedLogoBounds = {
  width: 480,
  height: 180,
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("The uploaded logo could not be read."));
    };

    reader.onerror = () => {
      reject(new Error("The uploaded logo could not be read."));
    };

    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The uploaded logo could not be processed as an image."));
    image.src = src;
  });

export const getContainDimensions = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) => {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const scale = Math.min(maxWidth / safeWidth, maxHeight / safeHeight, 1);

  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
};

export const getImageDimensions = async (dataUrl: string) => {
  const image = await loadImage(dataUrl);

  return {
    width: image.naturalWidth || image.width || 1,
    height: image.naturalHeight || image.height || 1,
  };
};

export const processLogoFile = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file for the company logo.");
  }

  if (file.size > 6 * 1024 * 1024) {
    throw new Error("The company logo is too large. Please upload an image under 6 MB.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const outputSize = getContainDimensions(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    storedLogoBounds.width,
    storedLogoBounds.height,
  );
  const canvas = document.createElement("canvas");

  canvas.width = outputSize.width;
  canvas.height = outputSize.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("The company logo could not be prepared for preview and export.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    fileName: file.name,
  };
};

export const dataUrlToUint8Array = (dataUrl: string) => {
  const [prefix, base64] = dataUrl.split(",", 2);

  if (!prefix || !base64 || !prefix.startsWith("data:image/")) {
    throw new Error("The stored company logo is not in a supported image format.");
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};
