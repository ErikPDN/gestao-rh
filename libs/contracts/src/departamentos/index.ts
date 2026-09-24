export * from './enums/nivel-cargo.enum.js';
export type {
  GetDepartamentoRequest,
  ListByIdsRequest,
  DepartamentoResponse,
  DepartamentosResponse,
  GetCargoRequest,
  CargoResponse,
  CargosResponse,
  DepartamentoServiceClient,
  DepartamentoServiceController,
} from './grpc/proto/departamento.js';
export {
  DEPARTAMENTO_PACKAGE_NAME,
  DepartamentoServiceControllerMethods,
  DEPARTAMENTO_SERVICE_NAME,
} from './grpc/proto/departamento.js';
export * from './interfaces/departamento-result.interface.js';
export * from './interfaces/cargo-result.interface.js';
export * from './dto/create-departamento.dto.js';
export * from './dto/update-departamento.dto.js';
export * from './dto/create-cargo.dto.js';
export * from './dto/get-departamento-query.dto.js'
export * from './dto/update-cargo.dto.js';
