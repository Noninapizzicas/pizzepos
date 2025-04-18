/**
 * Punto de entrada principal para el sistema PizzePOS
 * 
 * Este archivo inicia los módulos core y microservidor, que son los
 * componentes fundamentales del sistema.
 */

import { iniciarCorazon } from './modulos/corazon/index.js';
import { iniciarMicroservidor } from './modulos/microservidor/index.js';

async function iniciarSistema() {
  console.log('Iniciando sistema PizzePOS...');
  
  try {
    // Iniciar el core primero para que esté listo para recibir eventos
    console.log('Iniciando módulo corazon...');
    await iniciarCorazon();
    
    // Iniciar el microservidor una vez que el core esté listo
    console.log('Iniciando módulo microservidor...');
    await iniciarMicroservidor();
    
    console.log('Sistema PizzePOS iniciado correctamente.');
  } catch (error) {
    console.error('Error al iniciar el sistema:', error);
    process.exit(1);
  }
}

// Iniciar el sistema inmediatamente
iniciarSistema();
