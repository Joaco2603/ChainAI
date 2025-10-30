# 🎨 Vista Previa de la UI

## Paleta de Colores Implementada

```
┌─────────────────────────────────────────────┐
│  🎨 THEME: DARK BLUE & WHITE                │
├─────────────────────────────────────────────┤
│  Primary Blue:    #3182CE  ████████████████ │
│  Dark Blue 1:     #1A365D  ████████████████ │
│  Dark Blue 2:     #2C5282  ████████████████ │
│  Light Blue:      #63B3ED  ████████████████ │
│  Background:      #0A1929  ████████████████ │
│  White:           #FFFFFF  ████████████████ │
│  Gray:            #A0AEC0  ████████████████ │
│  Success Green:   #68D391  ████████████████ │
│  Error Red:       #FC8181  ████████████████ │
└─────────────────────────────────────────────┘
```

## 📱 Layout de la Aplicación

```
╔═══════════════════════════════════════════════════════════════╗
║  🤖 ChainAI     [Home] [Generate] [Upload Model]  [🦊 Wallet] ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║                      CONTENT AREA                             ║
║                   (Routes rendered here)                      ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║  Footer: ChainAI | Quick Links | Resources | Community       ║
║  © 2025 ChainAI. Built with ❤️ on Avalanche.                 ║
╚═══════════════════════════════════════════════════════════════╝
```

## 🏠 Home Page

```
╔═══════════════════════════════════════════════════════════════╗
║  AI Model Registry                                            ║
║  Explore and interact with decentralized AI models            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ ║
║  │ Model #0   [●]  │  │ Model #1   [●]  │  │ Model #2 [○] │ ║
║  │                 │  │                 │  │              │ ║
║  │ docker-img:v1.0 │  │ my-ai-model:v2  │  │ gpt-clone:1  │ ║
║  │                 │  │                 │  │              │ ║
║  │ ★★★★★ 4.8 / 5  │  │ ★★★★☆ 4.2 / 5  │  │ ★★★☆☆ 3.5/5 │ ║
║  │                 │  │                 │  │              │ ║
║  │ Ratings: 15     │  │ Ratings: 8      │  │ Ratings: 4   │ ║
║  │ Times Used: 42  │  │ Times Used: 23  │  │ Times Used:7 │ ║
║  └─────────────────┘  └─────────────────┘  └──────────────┘ ║
║                                                               ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ ║
║  │ Model #3   [●]  │  │ Model #4   [●]  │  │ Model #5 [●] │ ║
║  │ ... más cards   │  │ ... más cards   │  │ ... más      │ ║
║  └─────────────────┘  └─────────────────┘  └──────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Legend:
[●] = Active (verde)
[○] = Inactive (rojo)
★ = Filled star (dorado)
☆ = Empty star (gris)
```

## ✨ Generate/Prompt Page

```
╔═══════════════════════════════════════════════════════════════╗
║  Generate AI Content                                          ║
║  Enter your prompt and let the AI work its magic              ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ℹ️ Using Model #2                                            ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Your Prompt                                             │ ║
║  │                                                         │ ║
║  │ ┌─────────────────────────────────────────────────────┐│ ║
║  │ │ Write a short story about a robot discovering...   ││ ║
║  │ │                                                     ││ ║
║  │ │                                                     ││ ║
║  │ │                                                     ││ ║
║  │ └─────────────────────────────────────────────────────┘│ ║
║  │                                                         │ ║
║  │  [        Generate       ] [       Clear       ]       │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ ⏳ Status: Running...                                   │ ║
║  │                                                         │ ║
║  │ Model ID: 2                                             │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Cuando completa:
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ ✅ Status: Completed!                                   │ ║
║  │                                                         │ ║
║  │ Model ID: 2                                             │ ║
║  │                                                         │ ║
║  │ ┌───────────────────────────────────────────────────┐  │ ║
║  │ │ Once upon a time, in a world of circuits and     │  │ ║
║  │ │ steel, there lived a robot named R-7X...         │  │ ║
║  │ │ [Output text aquí...]                            │  │ ║
║  │ └───────────────────────────────────────────────────┘  │ ║
║  │                                                         │ ║
║  │ How was the result? Rate this model!                    │ ║
║  │              [   Rate Model   ]                         │ ║
║  └─────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

## ⭐ Rate Model Page

```
╔═══════════════════════════════════════════════════════════════╗
║  Rate AI Model                                                ║
║  Your feedback helps improve the ecosystem                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │                      Model #2                           │ ║
║  │                                                         │ ║
║  │  Current Rating: 4.2  |  Total Ratings: 8  |  Used: 23 │ ║
║  │                                                         │ ║
║  │  ┌─────────────────────────────────────────────────┐   │ ║
║  │  │ Docker Image:                                   │   │ ║
║  │  │ registry.example.com/ai-model:v2.0              │   │ ║
║  │  └─────────────────────────────────────────────────┘   │ ║
║  │                                                         │ ║
║  │  How would you rate this model?                         │ ║
║  │                                                         │ ║
║  │              ★ ★ ★ ★ ☆                                  │ ║
║  │           (Click stars to rate)                         │ ║
║  │                                                         │ ║
║  │          You selected 4 stars                           │ ║
║  │                                                         │ ║
║  │  [   Submit Rating   ] [     Cancel     ]              │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

## 📤 Upload Model Page

```
╔═══════════════════════════════════════════════════════════════╗
║  Upload AI Model                                              ║
║  Register your AI model on the Avalanche blockchain           ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ ℹ️ 📋 Docker Image Requirements                          │ ║
║  │                                                         │ ║
║  │  • Must accept input via env var INPUT_PROMPT           │ ║
║  │  • Must output JSON: {"output": "result"}               │ ║
║  │  • Must be publicly accessible                          │ ║
║  │  • Resource requirements < 2GB RAM                      │ ║
║  │                                                         │ ║
║  │  Example: myregistry/my-ai-model:v1.0                   │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ Docker Image URL *                                      │ ║
║  │                                                         │ ║
║  │ ┌─────────────────────────────────────────────────────┐│ ║
║  │ │ registry.example.com/username/model-name:tag        ││ ║
║  │ └─────────────────────────────────────────────────────┘│ ║
║  │                                                         │ ║
║  │ Enter the full Docker image URL including registry...   │ ║
║  │                                                         │ ║
║  │  [   Upload Model   ] [      Reset      ]              │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ ℹ️ 💡 What happens next?                                 │ ║
║  │                                                         │ ║
║  │  • Model registered on Avalanche blockchain             │ ║
║  │  • Unique Model ID assigned                             │ ║
║  │  • Users can discover and rate your model               │ ║
║  │  • Can be selected for AI generation tasks              │ ║
║  │  • Earn reputation as users rate your model             │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Success State:
╔═══════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │ ✅ Model Registered Successfully!                       │ ║
║  │                                                         │ ║
║  │ Model ID: #5                                            │ ║
║  │ Redirecting to home...                                  │ ║
║  └─────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════╝
```

## 🎯 Componentes Interactivos

### Star Rating Component

```
Estado Normal (No Interactive):
★★★★☆ 4.2 / 5

Estado Hover (Interactive):
★★★★★  ← Muestra 5 estrellas al pasar mouse

Estado Selected (Interactive):
★★★☆☆  ← 3 estrellas seleccionadas
You selected 3 stars
```

### Buttons

```
Primary Button:
┌─────────────────────┐
│    Generate    ⬆    │  ← Hover: se eleva
└─────────────────────┘

Loading Button:
┌─────────────────────┐
│ ⚪ Generating...     │  ← Spinner animado
└─────────────────────┘

Disabled Button:
┌─────────────────────┐
│    Generate    🔒   │  ← 50% opacity
└─────────────────────┘

Secondary Button:
┌─────────────────────┐
│      Cancel         │  ← Borde blanco
└─────────────────────┘
```

### Status Indicators

```
Pending:
┌─────────────────────────────┐
│ ⏳ Status: Pending...       │
└─────────────────────────────┘

Running:
┌─────────────────────────────┐
│ 🔄 Status: Running...       │
└─────────────────────────────┘

Completed:
┌─────────────────────────────┐
│ ✅ Status: Completed!        │
└─────────────────────────────┘

Failed:
┌─────────────────────────────┐
│ ❌ Status: Failed           │
│ Error: [error message]      │
└─────────────────────────────┘
```

### Wallet Connection

```
Not Connected:
┌──────────────────────┐
│ 🦊 Connect Wallet    │
└──────────────────────┘

Connected:
┌──────────────────────┐
│ ● 0x1234...5678      │  ← Dot verde + address truncada
└──────────────────────┘
```

## 🎨 Efectos Visuales

### Hover Effects

- Cards: Elevan 4px + sombra más fuerte
- Buttons: Elevan 2px + glow azul
- Links: Color cambia a azul claro

### Transitions

- Todas las animaciones: 0.2s ease
- Smooth scroll en navegación
- Fade in/out en loading states

### Gradients

```
Cards Background:
linear-gradient(135deg, #1A365D 0%, #2C5282 100%)

Page Background:
linear-gradient(to bottom, #0A1929 0%, #0F2847 100%)

Primary Buttons:
linear-gradient(135deg, #3182CE 0%, #2C5282 100%)
```

### Borders & Shadows

```
Cards:
- border-radius: 16px
- border: 1px solid rgba(255, 255, 255, 0.1)
- box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3)

Inputs:
- border-radius: 12px
- border: 2px solid rgba(255, 255, 255, 0.1)
- focus: border-color: #63B3ED
```

## 📱 Responsive Breakpoints

### Desktop (> 1024px)

- Grid: 3 columnas
- Max-width: 1400px centrado
- Sidebar visible

### Tablet (768px - 1024px)

- Grid: 2 columnas
- Max-width: 100%
- Menu compacto

### Mobile (< 768px)

- Grid: 1 columna
- Padding reducido
- Menu hamburguesa (futuro)

## 🎭 Estados de Carga

```
Loading Spinner:
     ⚪  ← Gira continuamente
  ⚪   ⚪
     ⚪

Loading Text:
"Loading models..."
"Generating..."
"Submitting..."

Empty State:
╔═══════════════════════════════╗
║   📭                          ║
║   No Models Available         ║
║   Be the first to upload!     ║
║   [  Upload Model  ]          ║
╚═══════════════════════════════╝

Error State:
╔═══════════════════════════════╗
║ ⚠️ Error: Failed to load      ║
║ [error details]               ║
╚═══════════════════════════════╝
```

---

Esta es la UI/UX implementada con tema azul oscuro y blanco según tus especificaciones! 🎨✨
