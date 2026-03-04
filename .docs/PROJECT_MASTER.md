# THERAPIA GLOBAL — MASTER PROJECT DOCUMENT
> Carpeta interna. No se sirve al usuario final. Solo para desarrollo.

---

## VISIÓN
Plataforma #1 mundial de educación terapéutica y osteopatía.
Superior a Wibbi en todos los niveles.
No bloquea contenido. Monetiza por servicios, IA, certificaciones y marca blanca.

---

## STACK TECNOLÓGICO

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| i18n | next-intl |
| Componentes | shadcn/ui + Radix UI |
| Estado global | Zustand |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Package manager | pnpm |

---

## IDIOMAS SOPORTADOS (10)

| Código | Idioma | RTL |
|---|---|---|
| en | English | No |
| es | Español | No |
| fr | Français | No |
| pt | Português | No |
| de | Deutsch | No |
| zh | 中文 | No |
| ja | 日本語 | No |
| ru | Русский | No |
| ar | العربية | SÍ |
| hi | हिन्दी | No |

---

## ESTRUCTURA DE CARPETAS

```
therapia-global/
├── .docs/                          ← Este archivo (oculto, solo dev)
├── src/
│   ├── app/
│   │   ├── [locale]/               ← Rutas internacionalizadas
│   │   │   ├── page.tsx            ← Landing page
│   │   │   ├── layout.tsx          ← Layout con providers
│   │   │   ├── dashboard/          ← Dashboard terapeuta
│   │   │   ├── exercises/          ← Biblioteca de ejercicios
│   │   │   ├── routines/           ← Constructor de rutinas
│   │   │   ├── patients/           ← Gestión de pacientes
│   │   │   ├── osteopathy/         ← Biblioteca osteopatía
│   │   │   ├── anatomy/            ← Anatomía interactiva
│   │   │   ├── community/          ← Red profesional
│   │   │   └── certifications/     ← OCULTO - solo visible cuando se active
│   │   │   └── patient/[token]/    ← Vista del paciente (sin login)
│   │   └── api/                    ← API routes
│   ├── components/
│   │   ├── ui/                     ← Componentes base (button, card, etc.)
│   │   ├── layout/                 ← Sidebar, Header, Footer
│   │   ├── exercises/              ← Tarjetas, filtros, player de ejercicios
│   │   ├── routines/               ← Builder drag&drop
│   │   ├── patients/               ← Lista, perfil, historial
│   │   ├── osteopathy/             ← Técnicas, filtros
│   │   ├── anatomy/                ← Regiones, capas de conocimiento
│   │   ├── dashboard/              ← Widgets, estadísticas
│   │   └── common/                 ← Componentes compartidos
│   ├── i18n/
│   │   ├── request.ts              ← Configuración next-intl
│   │   └── routing.ts              ← Locales y rutas
│   ├── lib/
│   │   ├── utils.ts                ← cn(), formatters
│   │   ├── constants.ts            ← Constantes globales
│   │   └── validations.ts          ← Schemas Zod
│   ├── hooks/                      ← Custom hooks
│   ├── stores/                     ← Zustand stores
│   └── types/                      ← TypeScript types globales
├── messages/
│   ├── en.json                     ← Traducciones inglés
│   ├── es.json                     ← Traducciones español
│   ├── fr.json                     ← Traducciones francés
│   ├── pt.json                     ← Traducciones portugués
│   ├── de.json                     ← Traducciones alemán
│   ├── zh.json                     ← Traducciones chino
│   ├── ja.json                     ← Traducciones japonés
│   ├── ru.json                     ← Traducciones ruso
│   ├── ar.json                     ← Traducciones árabe (RTL)
│   └── hi.json                     ← Traducciones hindi
└── public/
    ├── images/
    ├── icons/
    └── fonts/
```

---

## MÓDULOS Y ESTADO

| Módulo | Estado | Ruta | Prioridad |
|---|---|---|---|
| Landing page | En construcción | `/` | 1 |
| Dashboard terapeuta | En construcción | `/dashboard` | 1 |
| Biblioteca ejercicios | Pendiente | `/exercises` | 2 |
| Constructor de rutinas | Pendiente | `/routines` | 2 |
| Gestión pacientes | Pendiente | `/patients` | 2 |
| Vista paciente (link) | Pendiente | `/patient/[token]` | 2 |
| Biblioteca osteopatía | Pendiente | `/osteopathy` | 3 |
| Anatomía interactiva | Pendiente | `/anatomy` | 3 |
| Red profesional | Pendiente | `/community` | 4 |
| **Certificaciones** | **ARMADO PERO OCULTO** | `/certifications` | FUTURO |
| Motor IA | Pendiente | API interna | 4 |

---

## MÓDULO CERTIFICACIONES (OCULTO — LISTO PARA ACTIVAR)

El módulo existe en el código pero NO aparece en:
- Navegación lateral
- Rutas accesibles
- Landing page

Para activarlo: cambiar `CERTIFICATIONS_ENABLED = false` a `true` en `src/lib/constants.ts`

### Estructura del módulo:
- Tracks: Osteopatía Visceral I/II/III, Rehabilitación Funcional, Neurología Aplicada, Terapia Manual
- Evaluación: teórica + vídeo técnica + peer review
- Credencial digital verificable públicamente
- Precios: €199–€499 por track

---

## MODELO DE NEGOCIO

| Tier | Precio | Límites |
|---|---|---|
| Free | €0 | 10 pacientes, 5 rutinas/mes |
| Professional | €49/mes | Ilimitado + IA + analítica |
| Clinic | €199/mes | Multi-terapeuta + integraciones |
| Enterprise | Custom | White-label + API |
| Certificaciones | €199–€499 | Por track |

---

## VENTAJA COMPETITIVA (THE MOAT)

1. **Capa 1** — Estándar de contenido validado por expertos internacionales
2. **Capa 2** — Red global de terapeutas con efecto red
3. **Capa 3** — Base de datos clínica agregada anónima (mayor del mundo)
4. **Capa 4** — Motor IA entrenado con datos propios

Cada capa alimenta a la siguiente. Imposible de replicar sin masa crítica de usuarios.

---

## SESIONES DE CONSTRUCCIÓN

### Sesión 1 — Parte 1: Fundación (ACTUAL)
- [x] package.json, tsconfig.json, next.config.ts
- [x] tailwind.config.ts, postcss.config.mjs
- [ ] Estructura de carpetas
- [ ] Sistema i18n (10 idiomas)
- [ ] Design system (tokens, componentes UI base)
- [ ] Layout principal (sidebar + header)
- [ ] Landing page
- [ ] Dashboard terapeuta

### Sesión 2 — Parte 2: Ejercicios y Rutinas
- [ ] Biblioteca de ejercicios (filtros, búsqueda, cards)
- [ ] Player de ejercicio con subtítulos
- [ ] Constructor de rutinas drag & drop
- [ ] Sistema de envío (email + WhatsApp)

### Sesión 3 — Parte 3: Pacientes
- [ ] Gestión de pacientes
- [ ] Vista del paciente (link único, sin login)
- [ ] Sistema de tracking de visualización
- [ ] Alertas de adherencia

### Sesión 4 — Parte 4: Biblioteca Clínica
- [ ] Biblioteca de osteopatía (visceral/craneal/estructural)
- [ ] Anatomía interactiva por región
- [ ] 5 capas de conocimiento por región

### Sesión 5 — Parte 5: IA y Comunidad
- [ ] Motor de recomendación IA
- [ ] Red profesional
- [ ] Casos clínicos anonimizados
- [ ] Sistema de reputación

---

## CONFIGURACIONES IMPORTANTES

### Feature Flags (src/lib/constants.ts)
```typescript
CERTIFICATIONS_ENABLED = false  // Activar cuando sea el momento
AI_RECOMMENDATIONS_ENABLED = true
COMMUNITY_ENABLED = true
ANATOMY_3D_ENABLED = false      // Requiere Three.js — fase futura
```

### Colores del brand
- Brand principal: #3362ff (brand-600)
- Clinical green: #17c584 (clinical-500)
- Surface dark: #0a0f1e (surface-950)

### RTL
- Solo árabe (ar) usa RTL
- Detectado automáticamente por next-intl
- CSS usa logical properties (margin-inline, padding-inline)
