# ChainAI Frontend - UI/UX Guide

## 🎨 Design System

### Color Palette

- **Primary Blue**: `#3182CE` (Botones principales, enlaces activos)
- **Dark Blue**: `#1A365D`, `#2C5282` (Fondos de tarjetas, header)
- **Light Blue**: `#63B3ED` (Acentos, iconos)
- **Background**: `#0A1929`, `#0F2847` (Gradientes de fondo)
- **Text Primary**: `#FFFFFF` (Texto principal)
- **Text Secondary**: `#A0AEC0` (Texto secundario)
- **Success**: `#68D391` (Estados exitosos)
- **Error**: `#FC8181` (Estados de error)
- **Warning**: `#ED8936` (Estados de advertencia)

### Typography

- **Font Family**: 'Inter', sans-serif
- **Headings**: 700 weight, sizes 24px-36px
- **Body**: 400-600 weight, 14px-18px
- **Code**: 'Courier New', monospace

### Components

#### Buttons

- **Primary**: Gradiente azul, hover con elevación
- **Secondary**: Fondo transparente con borde
- **Disabled**: Opacidad 50%, cursor bloqueado

#### Cards

- Gradiente azul oscuro de fondo
- Bordes redondeados (16px)
- Sombras suaves
- Hover con elevación

#### Inputs

- Fondo semi-transparente
- Bordes sutiles
- Focus con borde azul
- Placeholders en gris

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Backend API running on `http://localhost:8000`
- Core Wallet extension installed

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:3000`

### Configuration

1. **Update Contract Address**: Edit `src/config/contract.ts`

   ```typescript
   export const CONTRACT_ADDRESS = '0xYourContractAddress';
   ```

2. **Update Backend URL**: If backend is not on localhost:8000
   ```typescript
   export const BACKEND_URL = 'http://your-backend-url/api/v1';
   ```

## 📱 Features

### 1. Home Page (`/`)

- **Lista de Modelos**: Grid responsivo mostrando todos los modelos
- **Ratings**: Visualización de estrellas con promedio
- **Estadísticas**: Contadores de ratings y usos
- **Navegación**: Click en tarjeta para ir a generar con ese modelo

### 2. Generate Page (`/prompt`)

- **Input de Prompt**: Textarea grande para texto
- **Botón Generate**: Inicia generación asíncrona
- **Status Tracking**: Polling automático del estado del job
- **Output Display**: Muestra resultado con formato
- **Rate Prompt**: Botón para calificar modelo después de usar

### 3. Rate Model Page (`/rate`)

- **Info del Modelo**: Muestra detalles y estadísticas actuales
- **Star Rating Interactivo**: Click para seleccionar 1-5 estrellas
- **Submit**: Envía rating al backend
- **Confirmación**: Mensaje de éxito y redirección

### 4. Upload Model Page (`/upload`)

- **Form**: Input para Docker image URL
- **Validación**: Checks en tiempo real
- **Guía**: Información sobre requisitos
- **Confirmación**: Muestra Model ID asignado

## 🔗 Wallet Integration

### Core Wallet Connection

- **Auto-detect**: Detecta si Core está instalado
- **Connect Button**: En header para conectar wallet
- **Display Address**: Muestra dirección truncada cuando conectado
- **Status Indicator**: Punto verde para conexión activa

### Web3 Context

Usa `useWeb3ConnectionContext` para acceder a:

- `connector`: Instancia del conector Core
- `useIsActive()`: Hook para estado de conexión
- `useAccount()`: Hook para dirección actual

## 🎯 User Flow

### Flujo Principal

1. **Conectar Wallet** → Click en "Connect Wallet" en header
2. **Explorar Modelos** → Ver lista en Home, ordenados por rating
3. **Generar Contenido** → Click en modelo → Ingresar prompt → Generate
4. **Ver Resultado** → Esperar procesamiento → Ver output
5. **Calificar** → Click en "Rate Model" → Seleccionar estrellas → Submit
6. **Subir Modelo** → Upload → Ingresar Docker URL → Submit

### Flujo Alternativo

1. **Upload directo** → Desde header, ir a "Upload Model"
2. **Generate sin modelo** → Va a `/prompt` sin modelId, backend selecciona
3. **Rate desde Home** → Implementar botón de rating en tarjetas

## 🔧 API Integration

### Services Layer

Todas las llamadas al backend están en `src/services/api.ts`:

- `getTopModels(limit)`: Lista de modelos top
- `getModel(modelId)`: Detalle de un modelo
- `uploadModel(data)`: Registrar nuevo modelo
- `rateModel(data)`: Calificar modelo
- `generateText(data)`: Iniciar generación
- `getJobStatus(jobId)`: Consultar estado de job

### Error Handling

- Try-catch en todas las llamadas
- Mensajes de error user-friendly
- Logging en console para debug

## 📊 State Management

### Local State (useState)

- Form inputs
- Loading states
- Error messages
- Success confirmations

### Context (Web3Connection)

- Wallet connection state
- Account address
- Network information

### URL State (useSearchParams)

- Model ID en /prompt y /rate
- Permite compartir links directos

## 🎨 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Grid System

- `grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))`
- Adapta automáticamente columnas según ancho

## 🚧 Future Enhancements

### Pending Features

1. **Model Details Page**: Vista detallada con histórico
2. **User Profile**: Ver modelos propios y ratings dados
3. **Search/Filter**: Buscar modelos por nombre o filtrar por rating
4. **Pagination**: Para listas largas de modelos
5. **Real-time Updates**: WebSocket para status en tiempo real
6. **Theme Toggle**: Opción de tema claro/oscuro
7. **Mobile Menu**: Hamburger menu para navegación mobile

### Optimizations

1. **Code Splitting**: Lazy loading de rutas
2. **Image Optimization**: Si se agregan imágenes de modelos
3. **Caching**: React Query para caché de API calls
4. **Error Boundaries**: Para manejo de errores de componentes

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to backend"**

- Verificar que backend esté corriendo en puerto 8000
- Revisar CORS settings en backend
- Actualizar `BACKEND_URL` en config

**"Core Wallet not found"**

- Instalar extensión Core Wallet
- Recargar página después de instalar

**"Transaction failed"**

- Verificar balance de AVAX para gas
- Confirmar que estás en red correcta (Fuji)
- Revisar que contract address sea correcto

**"Models not loading"**

- Verificar que haya modelos registrados
- Revisar logs de backend
- Confirmar que backend pueda acceder a blockchain

## 📝 Code Style

### TypeScript

- Interfaces para todos los tipos
- Props typing en componentes
- Evitar `any`, usar tipos específicos

### Styled Components

- Un componente styled por elemento visual
- Nombres descriptivos en PascalCase
- Props con $ prefix para evitar DOM warnings

### Component Structure

```tsx
// 1. Imports
// 2. Styled components
// 3. Component definition
// 4. Hooks
// 5. Handlers
// 6. Render
```

## 🤝 Contributing

Para agregar nuevas features:

1. Crear componente en carpeta apropiada
2. Agregar ruta en App.tsx si es página
3. Actualizar tipos en `types/index.ts`
4. Agregar servicio en `services/api.ts` si requiere API
5. Seguir guía de estilos y colores
6. Testear en diferentes tamaños de pantalla

---

Built with ❤️ using React, TypeScript, Styled Components, and Avalanche
