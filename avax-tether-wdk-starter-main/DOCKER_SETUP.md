# 🐳 Solución: Docker no está corriendo

## ❌ El Problema
```
error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

Esto significa que **Docker Desktop no está ejecutándose** en tu sistema Windows.

---

## ✅ Solución

### Opción 1: Iniciar Docker Desktop (Recomendado)
1. Abre el menú de inicio de Windows
2. Busca "Docker Desktop"
3. Click para abrir
4. Espera a que el icono de Docker en la bandeja del sistema diga "Docker Desktop is running"
5. Luego ejecuta de nuevo:
   ```bash
   yarn avalanche:up
   ```

### Opción 2: Si NO tienes Docker Desktop instalado

#### Instalar Docker Desktop para Windows:
1. Ve a: https://www.docker.com/products/docker-desktop
2. Descarga Docker Desktop para Windows
3. Instala y reinicia tu computadora
4. Abre Docker Desktop
5. Ejecuta: `yarn avalanche:up`

---

## 🎯 Alternativa SIN Docker (Más Simple)

Si no quieres usar Docker, puedes usar **Hardhat Network** (red local de Ethereum que también funciona para Avalanche C-Chain):

### Paso 1: Actualiza `hardhat.config.ts`
```typescript
networks: {
    hardhat: {
      chainId: 43112, // Simular Avalanche
    },
    // ... resto de redes
}
```

### Paso 2: Usa Hardhat Node en lugar de Docker
```bash
# Terminal 1: Iniciar Hardhat node
yarn hardhat:chain

# Terminal 2: Deploy (en otra terminal)
yarn deploy

# Terminal 3: Frontend
yarn start
```

---

## 🚀 Comandos Rápidos (Una vez Docker esté corriendo)

```bash
# 1. Iniciar nodo local
yarn avalanche:up

# 2. Verificar estado
yarn avalanche:status

# 3. Deploy contratos
yarn deploy:local

# 4. Ver logs (si hay problemas)
yarn avalanche:logs

# 5. Detener nodo
yarn avalanche:down

# 6. Limpiar todo y empezar de cero
yarn avalanche:clean
```

---

## 📝 Troubleshooting

### Docker Desktop no inicia
- Reinicia tu computadora
- Verifica que la virtualización esté habilitada en BIOS
- Actualiza Windows a la última versión
- Reinstala Docker Desktop

### Docker está lento
- Aumenta la memoria RAM asignada a Docker (Settings > Resources)
- Aumenta el espacio en disco

### Prefiero no usar Docker
- Usa `yarn hardhat:chain` (más simple)
- No necesitas Docker para desarrollo local

---

## ✨ Recomendación

Para **desarrollo local rápido sin Docker**:

1. Edita `package.json`:
```json
"deploy:local": "yarn workspace @se-2/hardhat deploy --network hardhat"
```

2. En una terminal:
```bash
yarn hardhat:chain
```

3. En otra terminal:
```bash
yarn deploy
yarn start
```

**¡Y listo!** No necesitas Docker para empezar 🎉

---

## 🤔 ¿Cuándo usar Docker vs Hardhat?

| Característica | Docker (Avalanche) | Hardhat Network |
|----------------|-------------------|-----------------|
| **Setup** | Requiere Docker | Incluido, sin instalación |
| **Velocidad** | Medio | Muy rápido |
| **Realismo** | Alta (Avalanche real) | Media (simula EVM) |
| **Complejidad** | Media | Baja |
| **Recomendado para** | Testing final | Desarrollo rápido |

**Mi recomendación**: Empieza con **Hardhat Network** (sin Docker) para desarrollo rápido, y usa Docker cuando necesites probar características específicas de Avalanche.
