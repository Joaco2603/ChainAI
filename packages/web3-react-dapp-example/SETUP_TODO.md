# ✅ TODO: Pasos para Completar la Configuración

## 🎯 Configuración Necesaria

### 1. Actualizar Dirección del Contrato

**Archivo**: `src/config/contract.ts`

Reemplaza la línea:

```typescript
export const CONTRACT_ADDRESS = '0xYourContractAddressHere';
```

Con la dirección de tu contrato desplegado. Para obtenerla:

```bash
# Si usaste Hardhat para desplegar
cd ../model-chain-contracts
# Busca en los logs del deploy o en artifacts/
```

### 2. Verificar Backend Corriendo

Asegúrate de que el backend esté activo:

```bash
cd ../backend
# Activar virtual environment
venv\Scripts\activate  # Windows
# o
source venv/bin/activate  # Linux/Mac

# Iniciar backend
python -m app.main
```

Verifica que responda en: http://localhost:8000/api/v1/health

### 3. Configurar .env del Backend (si aún no lo hiciste)

**Archivo**: `packages/backend/.env`

```env
WEB3_PROVIDER_URI=https://api.avax-test.network/ext/bc/C/rpc
CONTRACT_ADDRESS=0xTuDireccionDelContrato
PRIVATE_KEY=tu_private_key_sin_0x
CHAIN_ID=43113
```

### 4. Instalar Core Wallet

Si no tienes Core Wallet:

1. Descarga desde https://core.app/
2. Crea una wallet o importa una existente
3. Cambia a Fuji Testnet
4. Obtén AVAX de prueba: https://faucet.avax.network/

## 🚀 Iniciar la Aplicación

### Terminal 1 - Backend

```bash
cd packages/backend
venv\Scripts\activate
python -m app.main
```

### Terminal 2 - Frontend

```bash
cd packages/web3-react-dapp-example
npm start
```

La app se abrirá en http://localhost:3000

## ✨ Probar Funcionalidad

### Test 1: Conectar Wallet

1. Click en "Connect Wallet" en el header
2. Autorizar en Core Wallet
3. Verificar que aparezca tu dirección truncada

### Test 2: Explorar Modelos

1. Ir a Home (página principal)
2. Deberías ver lista de modelos (si hay alguno registrado)
3. Click en una tarjeta para ir a generar

### Test 3: Subir Modelo de Prueba

1. Click en "Upload Model" en el menú
2. Ingresar URL de Docker (ej: `python:3.9-slim`)
3. Click en "Upload Model"
4. Esperar confirmación con Model ID
5. Verificar que aparezca en Home

### Test 4: Generar Texto

1. Click en "Generate" en el menú
2. Ingresar un prompt (ej: "Write a haiku about blockchain")
3. Click en "Generate"
4. Observar estados: pending → running → completed
5. Ver resultado generado

### Test 5: Calificar Modelo

1. Después de generar, click en "Rate Model"
2. Seleccionar número de estrellas (1-5)
3. Click en "Submit Rating"
4. Verificar confirmación y redirección a Home

## 🔍 Verificar Integración

### Checklist Frontend-Backend

- [ ] Backend responde en /api/v1/health
- [ ] Frontend puede listar modelos (GET /api/v1/models/top)
- [ ] Puede subir modelo (POST /api/v1/models/upload-model)
- [ ] Puede generar texto (POST /api/v1/generate)
- [ ] Puede calificar modelo (POST /api/v1/models/rate-model)

### Checklist Frontend-Blockchain

- [ ] Core Wallet detectada
- [ ] Puede conectar wallet
- [ ] Muestra dirección correctamente
- [ ] Red es Fuji Testnet (chainId: 43113)

### Checklist UI/UX

- [ ] Tema azul oscuro aplicado
- [ ] Navegación funciona entre páginas
- [ ] Botones tienen hover effects
- [ ] Loading states se muestran
- [ ] Errores se muestran claramente
- [ ] Estrellas se pueden clickear para calificar

## 🐛 Si algo no funciona

### Frontend no inicia

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm start
```

### Backend no responde

```bash
# Verificar que está corriendo
curl http://localhost:8000/api/v1/health

# Ver logs
python -m app.main
```

### Core no conecta

- Refrescar página
- Reabrir Core Wallet
- Verificar que esté en Fuji Testnet
- Limpiar cookies del sitio

### Modelos no cargan

```bash
# En backend, verificar conexión a blockchain
curl http://localhost:8000/api/v1/health
# Revisar que "blockchain" tenga status healthy
```

### Errores de CORS

El backend debe tener CORS habilitado para localhost:3000
Verificar en `packages/backend/app/main.py` que haya:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 Notas Importantes

1. **Gas Fees**: Todas las transacciones (upload, rate) requieren AVAX para gas
2. **Async Jobs**: La generación es asíncrona, puede tardar según el modelo
3. **Docker Images**: Para que funcione generación real, el Docker image debe existir
4. **Contract State**: Los ratings y modelos se guardan en blockchain (persistente)

## 🎨 Personalización Opcional

### Cambiar Colores

Editar `src/index.css` y componentes styled-components:

- Primary: `#3182CE` → tu color
- Background: `#0A1929` → tu color
- Buscar y reemplazar en todos los archivos

### Cambiar Logo

Editar `src/components/Header.tsx`:

```typescript
<LogoIcon>🤖</LogoIcon>  // Cambiar emoji
<LogoText>
  Chain<span>AI</span>   // Cambiar texto
</LogoText>
```

### Agregar Páginas

1. Crear componente en `src/pages/`
2. Agregar ruta en `src/App.tsx`:

```typescript
<Route path="/tu-ruta" element={<TuComponente />} />
```

3. Agregar link en `src/components/Header.tsx`

## 🚀 Deploy a Producción

Cuando esté listo para deploy:

```bash
# Build frontend
npm run build

# El build estará en /build
# Puede servirse con cualquier servidor estático
# o desplegarse en Vercel, Netlify, etc.
```

Recuerda actualizar:

- `BACKEND_URL` a tu backend en producción
- `CONTRACT_ADDRESS` si es mainnet
- Core Wallet a Mainnet en lugar de Fuji

---

¡Todo listo! Si sigues estos pasos deberías tener la aplicación funcionando completamente. 🎉
