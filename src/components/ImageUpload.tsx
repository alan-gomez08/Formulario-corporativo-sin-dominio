import { useState, useCallback } from 'react';
import { X, ImagePlus, Loader2 } from 'lucide-react';

interface Props {
  label?: string;
  onChange: (fileUrl: string) => void;
  value?: string;
  userId?: string;
  clientFolder?: string; // Nombre del cliente / empresa para organizar en Cloudinary
  imageType?: string;    // 'logotipo' | 'portada_desktop' | 'portada_mobile' | 'equipo_instalaciones'
}

export default function ImageUpload({ label, onChange, value, userId, clientFolder, imageType }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Configuración de Cloudinary (con soporte para .env o defaults verificados)
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "t8nl8hwm";
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "portal_imagenes";

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadToCloudinary(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadToCloudinary(e.target.files[0]);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    if (!CLOUD_NAME || CLOUD_NAME === "TU_CLOUD_NAME") {
      alert("Falta configurar el Cloud Name de Cloudinary en el código o en las variables de entorno.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // ESTRUCTURA DE CARPETAS EN CLOUDINARY:
    const BASE_FOLDER = import.meta.env.VITE_CLOUDINARY_BASE_FOLDER || 'Template Corporativo - Sin dominio';
    const rawFolder = (clientFolder || userId || 'cliente_general').trim();
    const safeFolder = rawFolder
      .replace(/[<>:"/\\|?*#]+/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');

    formData.append('folder', `${BASE_FOLDER}/${safeFolder}`);

    // Si se especifica el tipo de imagen, se le asigna un nombre claro dentro de la carpeta
    if (imageType) {
      const safeType = imageType.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      formData.append('public_id', `${safeType}_${Date.now()}`);
    }

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        console.error("Error respuesta Cloudinary:", data);
        alert(data.error?.message || "Error al subir la imagen a Cloudinary. Por favor, intentá nuevamente.");
      }
    } catch (error) {
      console.error("Error subiendo a Cloudinary:", error);
      alert("Hubo un problema de conexión al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => onChange('');

  return (
    <div className="w-full flex flex-col gap-2">
      {label && <span className="text-xs font-semibold text-slate-500 ml-1">{label}</span>}
      
      {value ? (
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 bg-white group flex items-center justify-center p-2 shadow-xs">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
            <button onClick={clearImage} className="bg-white hover:bg-red-50 text-red-600 p-2.5 rounded-xl border border-slate-200 shadow-md hover:scale-105 transition-all cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-44 border border-dashed rounded-2xl transition-all duration-200
            ${isDragging ? 'border-slate-900 bg-slate-50 scale-[1.01]' : 'border-slate-300 bg-white hover:bg-slate-50/80 hover:border-slate-400'}
            ${isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2.5 text-slate-600">
              <Loader2 size={26} className="animate-spin text-slate-700" />
              <span className="font-medium text-xs text-slate-600">Cargando archivo...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2.5 p-4 text-center">
              <div className={`p-3 rounded-xl transition-colors duration-200 ${isDragging ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/80'}`}>
                <ImagePlus size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-0.5"><span>Cargar fotografía</span></p>
                <p className="text-[11px] text-slate-400">Haz clic o arrastra un archivo aquí</p>
              </div>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}