# 🚀 Quick Start - ChainAI Frontend

## ⚡ Inicio Rápido

### 1. Instalar Dependencias

```bash
cd packages/web3-react-dapp-example
npm install
```

### 2. Configurar Variables

**Editar `src/config/contract.ts`:**

```typescript
export const CONTRACT_ADDRESS = 'TU_DIRECCION_DEL_CONTRATO';
export const BACKEND_URL = 'http://localhost:8000/api/v1';
```

### 3. Iniciar Backend

En otra terminal:

```bash
cd packages/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

### 4. Iniciar Frontend

```bash
npm start
```

Abre http://localhost:3000

## 📋 Checklist de Configuración

- [ ] Node.js 16+ instalado
- [ ] Backend corriendo en puerto 8000
- [ ] Core Wallet instalado en navegador
- [ ] Contract address actualizado en config
- [ ] Wallet conectada a Fuji Testnet
- [ ] AVAX de prueba en wallet

## 🎯 Primeros Pasos

1. **Conectar Wallet**: Click en botón "Connect Wallet" en header
2. **Explorar Modelos**: Ver lista en página Home
3. **Probar Generación**: Click en "Generate" → Ingresar prompt
4. **Calificar Modelo**: Después de generar, click en "Rate Model"
5. **Subir Modelo**: Click en "Upload Model" → Ingresar Docker URL

## 🎨 Características Implementadas

### ✅ Vista Home

- Lista completa de modelos en grid responsivo
- Sistema de ratings con estrellas (promedio + count)
- Estadísticas: número de ratings y veces usado
- Click en tarjeta para ir a generar con ese modelo
- Estado visual: activo/inactivo
- Tema: gradientes azul oscuro con acentos blancos

### ✅ Vista Prompt/Generate

- Textarea grande para ingresar prompt
- Botón "Generar" con estado de loading
- Polling automático del estado del job
- Muestra estados: pending → running → completed/failed
- Display del output con formato
- Botón para calificar modelo después de usar
- Manejo de errores con mensajes claros

### ✅ Vista Rate Model

- Muestra información completa del modelo
- Rating actual, contador y estadísticas
- Componente interactivo de estrellas (1-5)
- Validación antes de submit
- Confirmación visual y auto-redirección
- URL con modelId para compartir

### ✅ Vista Upload Model

- Formulario para Docker image URL
- Información detallada de requisitos
- Ejemplos de formato correcto
- Validación en tiempo real
- Mensaje de éxito con Model ID asignado
- Guía de "qué sigue" después de subir

### ✅ Layout y Navegación

- Header sticky con logo y menú
- Navegación entre páginas con rutas
- Botón de conexión de wallet en header
- Estado visual de conexión (dot verde)
- Footer con links y información
- Tema consistente en toda la app

### ✅ UI/UX Design

- **Colores**: Azul oscuro (#1A365D, #2C5282) + Blanco (#FFFFFF)
- **Acentos**: Azul claro (#63B3ED) para CTAs
- **Gradientes**: Fondos y botones con degradados suaves
- **Sombras**: Elevación en cards y hover effects
- **Transiciones**: Smooth animations (0.2s ease)
- **Tipografía**: Inter font, jerarquía clara
- **Responsive**: Grid auto-adaptable
- **Estados**: Loading, error, success con colores semánticos

### ✅ Integración Backend

- Servicio API centralizado con axios
- Tipos TypeScript para todas las respuestas
- Manejo de errores consistente
- Loading states en todas las operaciones
- Polling para jobs asíncronos

### ✅ Integración Blockchain

- Configuración de contrato con ABI
- Context de Web3 ya integrado
- Detección de Core Wallet
- Manejo de conexión/desconexión
- Ready para transacciones directas

## 🔧 Configuración Avanzada

### Cambiar Puerto del Frontend

```bash
PORT=3001 npm start
```

### Cambiar Backend URL

Editar `src/config/contract.ts`:

```typescript
export const BACKEND_URL = 'http://tu-backend:puerto/api/v1';
```

### Usar Mainnet en lugar de Fuji

Editar `src/config/contract.ts`:

```typescript
// Descomentar AVALANCHE_MAINNET_PARAMS
// Actualizar CONTRACT_ADDRESS con dirección de mainnet
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── StarRating.tsx  # Sistema de estrellas
│   ├── Header.tsx      # Header con navegación
│   ├── Layout.tsx      # Layout principal
│   └── connect.tsx     # Botón de conexión (legacy)
├── pages/              # Vistas principales
│   ├── Home.tsx        # Lista de modelos
│   ├── Prompt.tsx      # Generación de texto
│   ├── RateModel.tsx   # Calificar modelos
│   └── UploadModel.tsx # Subir nuevos modelos
├── services/           # Lógica de negocio
│   └── api.ts          # Cliente API con axios
├── config/             # Configuración
│   └── contract.ts     # ABI y direcciones
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces y types
├── context/            # React Context
│   └── web3Connection.context.tsx
├── App.tsx             # Router y rutas
├── index.tsx           # Entry point
└── index.css           # Estilos globales
```

## 🐛 Troubleshooting Rápido

**Backend no responde:**

```bash
# Verificar que esté corriendo
curl http://localhost:8000/api/v1/health
```

**Core Wallet no detectada:**

- Instalar desde https://core.app/
- Refrescar página después de instalar
- Verificar que esté habilitada para el sitio

**Errores de compilación:**

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Modelos no cargan:**

- Verificar backend esté conectado a blockchain
- Confirmar que existan modelos registrados
- Revisar console del navegador para errores

## 📞 Próximos Pasos

1. **Configurar Contract**: Actualizar dirección del contrato desplegado
2. **Probar Flow Completo**: Conectar → Explorar → Generar → Calificar
3. **Subir Primer Modelo**: Usar Docker image de prueba
4. **Personalizar**: Ajustar colores, textos, o agregar features

## 💡 Tips

- Usa React DevTools para inspeccionar state
- Abre Network tab para ver llamadas API
- Console logs están activos en desarrollo
- Hot reload automático al editar código
- Styled components permite modificar estilos fácilmente

---

¿Necesitas ayuda? Revisa FRONTEND_GUIDE.md para documentación completa.
