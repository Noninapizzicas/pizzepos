/**
 * PizzePOS - Complemento de productos
 * 
 * Este complemento gestiona la validación y procesamiento de productos
 * para el catálogo del restaurante.
 */

import { z } from 'zod';
import { leerJSONSeguro, emitirError } from '../utils/helpers';

// Esquema Zod para validar un producto individual
const esquemaProducto = z.object({
  id: z.string().regex(/^p[0-9]{3}$/, "ID debe tener formato p seguido de 3 dígitos"),
  nombre: z.string().min(3).max(50),
  descripcion: z.string().max(200).optional(),
  precio: z.number().positive(),
  categoria: z.enum(["pizzas", "bebidas", "postres", "entrantes"]),
  disponible: z.boolean().default(true),
  opciones: z.array(z.string()).default([])
});

// Esquema para validar el array completo de productos
const esquemaProductos = z.array(esquemaProducto);

// Tipo para un producto basado en el esquema
export type Producto = z.infer<typeof esquemaProducto>;

/**
 * Valida un conjunto de productos con el esquema Zod
 */
export async function validar(datos: any): Promise<{ valido: boolean; errores?: string[] }> {
  try {
    // Verificar si es un array
    if (!Array.isArray(datos)) {
      return {
        valido: false,
        errores: ['Los datos deben ser un array de productos']
      };
    }
    
    // Validar con Zod
    esquemaProductos.parse(datos);
    
    return { valido: true };
  } catch (error) {
    // Si es un error de Zod, extraer los mensajes
    if (error instanceof z.ZodError) {
      const errores = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return {
        valido: false,
        errores
      };
    }
    
    // Otro tipo de error
    return {
      valido: false,
      errores: [String(error)]
    };
  }
}

/**
 * Procesa un conjunto de productos antes de guardarlos
 */
export async function procesar(datos: any): Promise<any> {
  // Validar datos primero
  const resultado = await validar(datos);
  
  if (!resultado.valido) {
    throw new Error(`Datos inválidos: ${resultado.errores?.join(', ')}`);
  }
  
  // Procesar datos - en este caso, ordenamos por categoría y nombre
  return datos.sort((a: Producto, b: Producto) => {
    // Primero ordenar por categoría
    if (a.categoria < b.categoria) return -1;
    if (a.categoria > b.categoria) return 1;
    
    // Luego ordenar por nombre
    return a.nombre.localeCompare(b.nombre);
  });
}

/**
 * Obtiene la plantilla para el complemento
 */
export async function obtenerPlantilla(): Promise<any> {
  return {
    "camposRequeridos": ["id", "nombre", "precio", "categoria"],
    "ejemplo": {
      "id": "p001",
      "nombre": "Pizza Margarita",
      "descripcion": "La clásica pizza con tomate y mozzarella",
      "precio": 8.99,
      "categoria": "pizzas",
      "disponible": true,
      "opciones": []
    }
  };
}

/**
 * Exportar las funciones públicas del complemento
 */
export default {
  validar,
  procesar,
  obtenerPlantilla
};
