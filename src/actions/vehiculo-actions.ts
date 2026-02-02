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

    // Rechazar imágenes base64
    if (cleaned.startsWith('data:image')) {
        console.warn('⚠️ Imagen base64 detectada, no se guardará.');
        return null;
    }

    // Si contiene "public\\" o "public/", quitarlo y agregar /
    if (cleaned.includes('public\\') || cleaned.includes('public/')) {
        cleaned = cleaned.replace(/^.*public[\\\/]/, '/');
    }

    // Si es ruta local de Windows (C:\...), devolver null
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

export const getVehiculos = async (): Promise<ActionState> => {
    try {
        const vehiculo = await prisma.vehiculo.findMany({
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
            data: vehiculo
        };

    } catch (error) {
        return {
            error: "Error al obtener los vehículos",
            success: false
        }
    }
};

export const createVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const nombre = formData.get('nombre') as string;
        const srcImageRaw = formData.get('srcImage') as string;
        const estadoValue = formData.get('estado');

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del vehículo es requerido",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';

        const nuevoVehiculo = await prisma.vehiculo.create({
            data: {
                id: crypto.randomUUID(),
                nombre: nombre.trim(),
                srcImage: srcImage,
                estado: estado,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/vehiculo');
        
        return {
            success: true,
            data: nuevoVehiculo
        };
    } catch (error) {
        return {
            error: "Error al crear el vehículo. Intente nuevamente",
            success: false
        };
    }
};

export const actualizarVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
 
    try {
        const id = formData.get('id') as string;
        const nombre = formData.get('nombre') as string;
        const srcImageRaw = formData.get('srcImage') as string;
        const estadoValue = formData.get('estado');

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del vehículo es requerido",
                success: false
            };
        }

        const existe = await prisma.vehiculo.findUnique({
            where: { id }
        });

        if (!existe) {
            return {
                error: "Vehículo no encontrado",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';

        const vehiculoActualizado = await prisma.vehiculo.update({
            where: { id },
            data: {
                nombre: nombre.trim(),
                srcImage: srcImage,
                estado: estado,
                updatedAt: new Date()
            }
        });

        revalidatePath('/vehiculo');
        
        return {
            success: true,
            data: vehiculoActualizado
        };
    } catch (error) {
        return {
            error: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

export const deleteVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const id = formData.get('id') as string;
        
        const vehiculoExistente = await prisma.vehiculo.findUnique({
            where: { id },
            include: {
                vehiculo_servicio: {
                    include: {
                        turno: true
                    }
                }
            }
        });

        if (!vehiculoExistente) {
            return {
                error: "Vehículo no encontrado",
                success: false
            };
        }

        const tieneTurnos = vehiculoExistente.vehiculo_servicio.some(
            (vs: { turno: any[] }) => vs.turno.length > 0
        );

        if (tieneTurnos) {
            return {
                error: "No se puede eliminar: tiene turnos asociados",
                success: false
            }
        }

        await prisma.vehiculo.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });
        revalidatePath('/vehiculo');
        
        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        return {
            error: "Error al dar de baja el vehículo",
            success: false
        };
    }
};