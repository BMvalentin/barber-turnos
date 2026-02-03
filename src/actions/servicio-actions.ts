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
        const servicios = await prisma.servicio.findMany({
            where: {
                estado: true
            },
            include: {
                barbero: {
                    select: {
                        id: true,
                        nombre: true,
                        srcImage: true,
                        estado: true,
                        margenes: {
                            where: {
                                estado: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: servicios
        };

    } catch (error) {
        console.error("Error al obtener servicios:", error);
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
        const barberoId = formData.get('barbero') as string;
        const descripcion = formData.get('descripcion') as string;

        // Validaciones
        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del servicio es requerido",
                success: false
            };
        }

        if (!barberoId || barberoId.trim() === '') {
            return {
                error: "El barbero es requerido",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';
        
        const nuevoServicio = await prisma.servicio.create({
            data: {
                barberoId: barberoId,
                nombre: nombre.trim(),
                descripcion: descripcion || null,
                srcImage: srcImage,
                estado: estado
            }
        });
        
        revalidatePath('/servicio');
        
        return {
            success: true,
            data: nuevoServicio
        };

    } catch (error) {
        console.error("Error al crear servicio:", error);
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
        const barberoId = formData.get('barbero') as string;
        const descripcion = formData.get('descripcion') as string;
        const estadoValue = formData.get('estado');

        // Validaciones
        if (!id || id.trim() === '') {
            return {
                error: "ID del servicio es requerido",
                success: false
            };
        }

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del servicio es requerido",
                success: false
            };
        }

        if (!barberoId || barberoId.trim() === '') {
            return {
                error: "El barbero es requerido",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';

        const servicioActualizado = await prisma.servicio.update({
            where: { id },
            data: {
                nombre: nombre.trim(),
                barberoId: barberoId,
                descripcion: descripcion || null,
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
        console.error("Error al actualizar servicio:", error);
        return {
            error: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

export const deleteservicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const id = formData.get('id') as string;

        if (!id || id.trim() === '') {
            return {
                error: "ID del servicio es requerido",
                success: false
            };
        }

        const servicioExistente = await prisma.servicio.findUnique({
            where: { id },
            include: {
                turnoServicios: {
                    include: {
                        turnos: true
                    }
                }
            }
        });


        // Verificar si tiene turnos asociados
        const tieneTurnos = servicioExistente.turnoServicios.some(
            (ts) => ts.turnos.length > 0
        );

        if (tieneTurnos) {
            return {
                error: "No se puede eliminar: tiene turnos asociados",
                success: false
            }
        }

        // Soft delete: cambiar estado a false en lugar de eliminar
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
        console.error("Error al eliminar servicio:", error);
        return {
            error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

//Función para obtener un servicio específico
export const getServicioById = async (id: string): Promise<ActionState> => {
    try {
        const servicio = await prisma.servicio.findUnique({
            where: { id },
            include: {
                barbero: {
                    select: {
                        id: true,
                        nombre: true,
                        srcImage: true,
                        estado: true
                    }
                }
            }
        });

        if (!servicio) {
            return {
                error: "Servicio no encontrado",
                success: false
            };
        }

        return {
            success: true,
            data: servicio
        };

    } catch (error) {
        console.error("Error al obtener servicio:", error);
        return {
            error: "Error al obtener el servicio",
            success: false
        };
    }
};