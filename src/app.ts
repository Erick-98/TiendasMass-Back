import express from 'express';
import cors from 'cors';
import path from 'path';
import usuariosRoutes from './routes/usuarios.routes';
import productRoutes from './routes/productos.routes';
import categoriRoutes from './routes/categoria.routes';
import { AppDataSource } from './config/data-source';
import pedidoRoutes from './routes/pedidos.routes';
import  MetodoPagoRoutes  from './routes/metodopago.routes';  
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
const PORT = process.env.PORT || 443;

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});



// Middleware
app.use(cors({
  origin: [
    'https://thankful-desert-05f80c31e.3.azurestaticapps.net',
    'http://localhost:3000',
    'backendtiendasmass-e6emcsagc9gududu.brazilsouth-01.azurewebsites.net',
    'https://e5cbc767e174.ngrok-free.app' // ← tu URL pública
  ],
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categorias', categoriRoutes);
app.use("/api/pedidos", pedidoRoutes); 
app.use('/api/metodos-pago', MetodoPagoRoutes);
app.use('/api/metodos-envio', metodoEnvioRoutes); 
app.use('/api', mercadoPagoRoutes); // ← perfecto
app.use('/api/roles', rolesRoutes);
app.use('/api/estados', estadoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/direcciones', direccionRoutes);
app.use('/api/tarjetas-usuario', tarjetaUsuarioRoutes);
app.use('/api', mercadoPagoRoutes);
app.get('/', (_req, res) => {
  res.send('🚀 Bienvenido a TienditaMass API. El backend está corriendo con éxito.');
});


// Error handler al final de app.ts
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error capturado:', err?.message, err?.response || err);
  // SDK v2 de MP suele traer más info en err.cause
  if (Array.isArray(err?.cause)) console.error('Causa MP:', err.cause);

  res.status(err?.status || 500).json({
    message: 'Internal error',
    detail: err?.message || 'sin detalle',
    cause: err?.cause || undefined,
  });
});

// Conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log('Conexión a la base de datos exitosa');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('Error al conectar con la base de datos:', error);
  });