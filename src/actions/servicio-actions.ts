"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

// Función helper para limpiar y validar URLs de imágenes
function cleanImageUrl(url: string | null): string | null {
    if (!url || url.trim() === '') return null;
    
    let cleaned = url.trim();
    
    // Si contiene "public\\" o "public/", quitarlo y agregar /
    if (cleaned.includes('public\\') || cleaned.includes('public/')) {
        cleaned = cleaned.replace(/^.*public[\\\/]/, '/');
    }
    
    // Si es ruta local de Windows (C:\...), devuelve null
    if (cleaned.match(/^[A-Za-z]:\\/)) {
        console.warn('⚠️ Ruta de Windows detectada, no se guardará:', cleaned);
        return null;
    }
    
    // Si es ruta relativa sin /, agregarla
    if (!cleaned.startsWith('http') && !cleaned.startsWith('/')) {
        cleaned = '/' + cleaned;
    }
    
    // Reemplazar \ por /
    cleaned = cleaned.replace(/\\/g, '/');
    
    return cleaned;
}

export const getServicios = async (): Promise<ActionState> => {
    try {
        const servicio = await prisma.servicio.findMany({
            where: {
                estado: true
            },
            include: {
                vehiculo_servicio: {
                    include: {
                        servicio: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: servicio
        };

    } catch (error) {
        return {
            error: "Error al obtener los servicios",
            success: false
        }
    }
};

export const createServicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    try {
        const nombre = formData.get('nombre') as string;
        const srcImageRaw = formData.get('srcImage') as string;
        const estadoValue = formData.get('estado');

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del servicio es requerido",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';
        
        const nuevoServicio = await prisma.servicio.create({
            data: {
                id: crypto.randomUUID(),
                nombre: nombre.trim(),
                srcImage: srcImage,
                estado: estado,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        revalidatePath('/servicio');
        return {
            success: true,
            data: nuevoServicio
        };
    } catch (error) {
        return {
            error: `Error al crear: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

export const actualizarServicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const id = formData.get('id') as string;
        const nombre = formData.get('nombre') as string;
        const srcImageRaw = formData.get('srcImage') as string;
        const estadoValue = formData.get('estado');

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del servicio es requerido",
                success: false
            };
        }

        // Verificar que el servicio existe
        const existe = await prisma.servicio.findUnique({
            where: { id }
        });

        if (!existe) {
            return {
                error: "Servicio no encontrado",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';

        const servicioActualizado = await prisma.servicio.update({
            where: { id },
            data: {
                nombre: nombre.trim(),
                srcImage: srcImage,
                estado: estado,
                updatedAt: new Date()
            }
        });
        revalidatePath('/servicio');
        return {
            success: true,
            data: servicioActualizado
        };
    } catch (error) {        
        return {
            error: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

export const deleteservicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const id = formData.get('id') as string;
        console.log("ID a eliminar:", id);

        const servicioExistente = await prisma.servicio.findUnique({
            where: { id },
            include: {
                vehiculo_servicio: {
                    include: {
                        turno: true
                    }
                }
            }
        });

        if (!servicioExistente) {
            return {
                error: "Servicio no encontrado",
                success: false
            };
        }

        const tieneTurnos = servicioExistente.vehiculo_servicio.some(
            (vs: { turno: any[] }) => vs.turno.length > 0
        );

        if (tieneTurnos) {
            return {
                error: "No se puede eliminar: tiene turnos asociados",
                success: false
            }
        }

        await prisma.servicio.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });
        revalidatePath('/servicio');
        
        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        return {
            error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};