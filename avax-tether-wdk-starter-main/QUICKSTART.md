# 🚀 QUICKSTART - ChainAI Development

## ⚡ Opción Rápida (RECOMENDADA): Hardhat Network

**Sin Docker, Sin esperas, 100% funcional**

```bash
# Terminal 1: Red local (instantánea)
yarn chain

# Terminal 2: Deploy
yarn deploy

# Terminal 3: Frontend
yarn start
```

**¡Listo en 30 segundos!** 🎉

Abre `http://localhost:3000`

---

## 🐳 Opción Avanzada: Avalanche Docker

**Nota:** Requiere sincronización (~5-10 minutos en primer arranque)

```bash
# Terminal 1: Iniciar nodo Avalanche
yarn avalanche:up

# Esperar 5-10 minutos hasta que:
yarn avalanche:status  # muestre "RUNNING" y "Block Height"

# Terminal 2: Deploy
yarn deploy:local

# Terminal 3: Frontend
yarn start
```

---

## 📝 Comandos Útiles

### Desarrollo Rápido (Hardhat)
```bash
yarn chain          # Red local instantánea
yarn deploy         # Deploy en Hardhat
yarn start          # Frontend
yarn hardhat:test   # Tests
```

### Avalanche Local (Docker)
```bash
yarn avalanche:up       # Iniciar
yarn avalanche:status   # Ver estado
yarn avalanche:logs     # Ver logs
yarn avalanche:down     # Detener
yarn avalanche:clean    # Limpiar todo
```

### Deploy
```bash
yarn deploy             # Hardhat local
yarn deploy:local       # Avalanche local
yarn deploy:fuji        # Fuji testnet
yarn deploy:mainnet     # Mainnet
```

---

## 🎯 ¿Cuál Usar?

| Necesitas | Usa |
|-----------|-----|
| **Desarrollo rápido** | `yarn chain` (Hardhat) |
| **Testing** | `yarn chain` (Hardhat) |
| **Probar características de Avalanche** | `yarn avalanche:up` (Docker) |
| **Deploy a testnet/mainnet** | Fuji/Mainnet |

---

## ✅ Verificación Rápida

### Hardhat Network (Instantáneo):
```bash
yarn chain
```
Deberías ver:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### Avalanche Docker (Toma tiempo):
```bash
yarn avalanche:up
# Esperar...
yarn avalanche:logs
```
Busca: `API server listening {"uri": "http://[::]:9650"}`

---

## 🐛 Troubleshooting

### "Cannot connect to network"
**Solución:** Usa Hardhat Network en su lugar:
```bash
yarn chain  # En vez de yarn avalanche:up
yarn deploy # En vez de yarn deploy:local
```

### Avalanche muy lento
- Primera vez siempre es lento (sincronización)
- Usa Hardhat Network para desarrollo rápido
- Avalanche solo cuando necesites características específicas

### Docker no funciona
- No es necesario para desarrollo
- Usa `yarn chain` (Hardhat Network)

---

## 🎉 Recomendación Final

**Para desarrollo normal de ChainAI, usa:**

```bash
# Setup (solo una vez)
yarn install

# Desarrollo diario
yarn chain    # Terminal 1
yarn deploy   # Terminal 2  
yarn start    # Terminal 3
```

**Avalanche Docker solo cuando:**
- Necesites probar características específicas de Avalanche
- Estés listo para testnet/mainnet
- Tengas tiempo de esperar la sincronización

---

## 📚 Próximos Pasos

1. ✅ **Usa Hardhat Network** para desarrollo
2. ✅ **Prueba tu DApp** localmente
3. ✅ **Deploy a Fuji** cuando estés listo
4. ✅ **Deploy a Mainnet** en producción

**Happy Coding! 🚀**
