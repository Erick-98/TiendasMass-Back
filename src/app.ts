import express from 'express';
import cors from 'cors';
import path from 'path';
import usuariosRoutes from './routes/usuarios.routes';
import productRoutes from './routes/productos.routes';
import categoriRoutes from './routes/categoria.routes';
import { AppDataSource } from './config/data-source';
import pedidoRoutes from './routes/pedidos.routes';
import MetodoPagoRoutes from './routes/metodopago.routes';
import metodoEnvioRoutes from './routes/metodoenvio.routes';
import rolesRoutes from './routes/rol.routes';
import estadoRoutes from './routes/estado.routes';
import dashboardRoutes from './routes/dashboard.routes';
import direccionRoutes from './routes/direccion.routes';
import tarjetaUsuarioRoutes from './routes/tarjeta-usuario.routes';
import authRoutes from './routes/auth.routes';
import setupRoutes from './routes/setup.routes';
import mercadoPagoRoutes from './routes/mercadoPago.routes';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 443;

// Health
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

/**
 * CORS
 * - Puedes pasar orígenes por env var CORS_ORIGINS (comma-separated).
 * - Si no existe, se usan los valores por defecto listados abajo.
 */
const defaultOrigins = [
  'https://ambitious-sea-040007f1e.3.azurestaticapps.net', // tu front deploy (ejemplo)
  'http://localhost:3000',
  'https://backendtiendasmass-e6emcsagc9gududu.brazilsouth-01.azurewebsites.net',
  'https://e5cbc767e174.ngrok-free.app'
];

const originsFromEnv = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];

const whitelist = originsFromEnv.length ? originsFromEnv : defaultOrigins;

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // origin === undefined for non-browser requests (Postman, curl, server-to-server)
    console.log('CORS request from origin:', origin);
    if (!origin) {
      return callback(null, true);
    }
    // Permitimos coincidencia exacta en whitelist
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // responder preflight OPTIONS

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (ajusta según tu estructura tras build)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categorias', categoriRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/metodos-pago', MetodoPagoRoutes);
app.use('/api/metodos-envio', metodoEnvioRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/estados', estadoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/direcciones', direccionRoutes);
app.use('/api/tarjetas-usuario', tarjetaUsuarioRoutes);
// Rutas de Mercado Pago (si exponen endpoints bajo /api)
app.use('/api', mercadoPagoRoutes);

app.get('/', (_req, res) => {
  res.send('🚀 Bienvenido a TienditaMass API. El backend está corriendo con éxito.');
});

// Error handler (al final)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error capturado:', err?.message || err);
  if (Array.isArray(err?.cause)) console.error('Causa MP:', err.cause);
  res.status(err?.status || 500).json({
    message: 'Internal error',
    detail: err?.message || 'sin detalle',
    cause: err?.cause || undefined,
  });
});

// Conexión a la DB y arranque de servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Conexión a la base de datos exitosa');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  });

export default app;
