import { AppDataSource } from "../config/data-source";
import { TarjetaUsuario } from "../entities/TarjetaUsuario.entity";
import { Usuario } from "../entities/Usuario.entity";

export const crearTarjeta = async (data: {
  usuarioId: number;
  tipoTarjeta: string;
  numeroTarjeta: string;
  fechaVencimiento: string;
  nombreEnTarjeta: string;
}) => {
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const tarjetaRepo = AppDataSource.getRepository(TarjetaUsuario);

  const usuario = await usuarioRepo.findOne({ where: { id: data.usuarioId } });
  if (!usuario) throw new Error("Usuario no encontrado");

  const ultimos4 = data.numeroTarjeta.slice(-4);
  const numeroEnmascarado = `**** **** **** ${ultimos4}`;

  const tarjeta = tarjetaRepo.create({
    usuario,
    tipoTarjeta: data.tipoTarjeta,
    numeroEnmascarado,
    fechaVencimiento: data.fechaVencimiento,
    nombreEnTarjeta: data.nombreEnTarjeta,
  });

  await tarjetaRepo.save(tarjeta);
  return tarjeta;
};
