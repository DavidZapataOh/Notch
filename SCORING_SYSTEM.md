# Sistema de Scoring de Notch - Documentación Técnica

## 🎯 Visión General

Notch implementa un sistema de gamificación completamente descentralizado usando **EAS (Ethereum Attestation Service)** para almacenar todos los datos de puntuación, tareas, badges y actividades de los usuarios. Esto garantiza que todos los datos sean verificables, inmutables y accesibles sin necesidad de un backend tradicional.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **EAS Client** (`lib/eas-client.ts`)
   - Cliente para interactuar con EAS en Base Network
   - Maneja todas las operaciones de attestations
   - Define schemas para diferentes tipos de datos

2. **Scoring Engine** (`lib/scoring-engine.ts`)
   - Motor principal de lógica de negocio
   - Maneja puntuaciones, tareas, badges y verificaciones
   - Integra con EAS para persistencia de datos

3. **React Hooks** (`lib/hooks/useScoring.ts`)
   - Hooks para usar el sistema desde componentes React
   - Manejo de estado y actualizaciones en tiempo real
   - Integración con wallets Web3

4. **APIs** (carpeta `app/api/`)
   - Endpoints para obtener datos y completar acciones
   - Verificación de actividades
   - Leaderboards y rankings

## 📊 Tipos de Datos en EAS

### 1. User Score Data
```typescript
interface UserScoreData {
  fid: number;
  totalScore: number;
  categoryScores: {
    Builder: number;
    Social: number;
    Degen: number;
    Player: number;
  };
  rank: string;
  level: number;
  season: number;
  lastUpdated: string;
}
```

### 2. Task Completion Data
```typescript
interface TaskCompletionData {
  fid: number;
  taskId: string;
  category: string;
  points: number;
  completedAt: string;
  verificationData: string; // JSON string
}
```

### 3. Badge Earned Data
```typescript
interface BadgeEarnedData {
  fid: number;
  badgeId: string;
  badgeName: string;
  category: string;
  rank: string;
  earnedAt: string;
}
```

### 4. Activity Log Data
```typescript
interface ActivityLogData {
  fid: number;
  activityType: string;
  category: string;
  points: number;
  timestamp: string;
  metadata: string; // JSON string
}
```

## 🎮 Sistema de Puntuación

### Categorías
- **Builder**: Actividades de desarrollo y construcción
- **Social**: Interacciones en Farcaster
- **Degen**: Actividades de trading y DeFi
- **Player**: Uso de miniapps y quests

### Ranks
- **Mini**: 0-99 puntos
- **Core**: 100-499 puntos
- **Plus**: 500-999 puntos
- **Pro**: 1000-2499 puntos
- **ProMax**: 2500+ puntos

### Cálculo de Niveles
```typescript
level = Math.floor(totalScore / 100) + 1
```

## 🏆 Sistema de Badges

### Badges por Categoría

#### Builder
- **First Deploy**: Desplegar primer contrato
- **Code Contributor**: Contribuir a 5 proyectos
- **Senior Builder**: Desplegar 10 contratos

#### Social
- **First Cast**: Publicar primer cast
- **Community Builder**: Publicar 50 casts
- **Influencer**: Publicar 200 casts

#### Degen
- **First Swap**: Hacer primer swap
- **Active Trader**: Hacer 25 swaps
- **Whale**: Hacer 100 swaps

#### Player
- **First Quest**: Completar primera quest
- **Quest Master**: Completar 20 quests
- **Legendary Player**: Completar 100 quests

## 📋 Sistema de Tareas

### Tipos de Tareas

#### Tareas Diarias
- **Share about Notch**: Cast mencionando @notch
- **Make a Swap**: Swap en Base Network

#### Tareas Semanales
- **Deploy on Base**: Desplegar contrato en Base
- **Try Partner App**: Usar app de partner

#### Tareas Especiales
- **Invite Friends**: Invitar 3 amigos

### Métodos de Verificación

1. **Farcaster API**: Verificar casts y interacciones
2. **On-chain**: Verificar transacciones en blockchain
3. **EAS Attestation**: Verificar attestations de partners
4. **Referral**: Verificar referencias de usuarios

## 🔧 Uso del Sistema

### En Componentes React

```typescript
import { useScoring } from '@/lib/hooks/useScoring';

function MyComponent() {
  const {
    userScore,
    userBadges,
    completedTasks,
    loading,
    addPoints,
    completeTask
  } = useScoring(userFid);

  const handleActivity = async () => {
    await addPoints('Social', 10, 'cast_published', {
      castId: '123',
      content: 'Hello Notch!'
    });
  };

  return (
    <div>
      {loading ? 'Loading...' : (
        <div>
          <p>Score: {userScore?.totalScore}</p>
          <p>Badges: {userBadges.length}</p>
        </div>
      )}
    </div>
  );
}
```

### APIs Disponibles

#### Obtener Score del Usuario
```bash
GET /api/user/score?fid=12345
```

#### Completar Tarea
```bash
POST /api/tasks/complete
{
  "fid": 12345,
  "taskId": "daily-cast-notch",
  "verificationData": { ... }
}
```

#### Obtener Leaderboard
```bash
GET /api/leaderboard?category=Builder&limit=50
```

## 🔐 Seguridad y Verificación

### Verificación de Actividades

1. **Farcaster**: Usando APIs de Neynar o Farcaster
2. **On-chain**: Consultando transacciones en Base
3. **EAS**: Verificando attestations específicas
4. **Referrals**: Tracking de invitaciones

### Inmutabilidad de Datos

- Todas las attestations son inmutables
- Las tareas completadas no se pueden revocar
- Los badges ganados son permanentes
- El historial de actividades es verificable

## 🚀 Configuración

### Variables de Entorno

```bash
# EAS Configuration
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
EAS_SCHEMA_REGISTRY=0x4200000000000000000000000000000000000020

# Farcaster API
NEYNAR_API_KEY=your_neynar_api_key

# Base Network
BASE_RPC_URL=https://mainnet.base.org
```

### Schemas EAS

Los schemas deben ser registrados en EAS antes de usar el sistema:

```typescript
// Registrar schemas
await easClient.registerSchemas();
```

## 📈 Escalabilidad

### Ventajas del Sistema EAS

1. **Descentralizado**: No requiere servidores centralizados
2. **Verificable**: Todas las attestations son verificables on-chain
3. **Escalable**: EAS maneja la escalabilidad automáticamente
4. **Interoperable**: Los datos pueden ser usados por otras apps
5. **Resistente**: Los datos no se pueden perder o manipular

### Optimizaciones

1. **Caching**: Usar Redis para cachear datos frecuentes
2. **Batch Operations**: Procesar múltiples attestations juntas
3. **Indexing**: Usar GraphQL para consultas complejas
4. **CDN**: Cachear datos estáticos en CDN

## 🔄 Flujo de Datos

1. **Usuario realiza actividad** → Se verifica on-chain o via API
2. **Se crea attestation** → Se guarda en EAS con datos verificables
3. **Se actualiza score** → Se calcula nuevo rank y level
4. **Se verifica badges** → Se otorgan badges si se cumplen requisitos
5. **Se actualiza UI** → Los componentes se actualizan automáticamente

## 🛠️ Desarrollo

### Agregar Nueva Tarea

```typescript
// En lib/scoring-engine.ts
export const DYNAMIC_TASKS = {
  daily: [
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Description of new task',
      category: 'Social',
      points: 25,
      verificationMethod: 'farcaster_api',
      verificationConfig: {
        keywords: ['keyword'],
        minLength: 10
      }
    }
  ]
};
```

### Agregar Nuevo Badge

```typescript
// En lib/scoring-engine.ts
export const BADGES = {
  Social: {
    'new-badge': {
      id: 'new-badge',
      name: 'New Badge',
      description: 'Description of new badge',
      category: 'Social',
      rank: 'Core',
      requirement: { type: 'cast_count', value: 10 },
      imageUrl: '/badges/new-badge.png'
    }
  }
};
```

## 🎯 Próximos Pasos

1. **Integración con Farcaster**: Obtener datos reales de usuarios
2. **Verificación On-chain**: Implementar verificaciones reales de transacciones
3. **Partner Integrations**: Conectar con otras miniapps
4. **Analytics**: Dashboard de analytics para el equipo
5. **Mobile App**: Aplicación móvil nativa
6. **Gamification**: Más mecánicas de juego y recompensas

---

Este sistema proporciona una base sólida y escalable para la gamificación en el ecosistema Web3, aprovechando las ventajas de la descentralización y la verificación on-chain.
