export * from './enums/nivel-cargo.enum.js';
export * from './enums/status-departamento.enum.js';
export type {
  GetDepartamentoRequest,
  GetDepartamentosRequest,
  CreateDepartamentoRequest,
  UpdateDepartamentoRequest,
  CreateCargoRequest,
  UpdateCargoRequest,
  GetCargosRequest,
  DepartamentoResponse,
  DepartamentosResponse,
  GetCargoRequest,
  CargoResponse,
  CargosResponse,
  DepartamentoServiceClient,
  DepartamentoServiceController,
  RemoverGestorRequest,
  RemoverGestorResponse,
} from './grpc/proto/departamento.js';
export {
  DEPARTAMENTO_PACKAGE_NAME,
  DepartamentoServiceControllerMethods,
  DEPARTAMENTO_SERVICE_NAME,
} from './grpc/proto/departamento.js';
export * from './interfaces/departamento-result.interface.js';
export * from './interfaces/departamento-dashboard-result.interface.js';
export * from './interfaces/cargo-result.interface.js';
export * from './dto/create-departamento.dto.js';
export * from './dto/update-departamento.dto.js';
export * from './dto/create-cargo.dto.js';
export * from './dto/get-departamento-query.dto.js';
export * from './dto/update-cargo.dto.js';
export * from './mappers/status-departamento.mapper.js';
export * from './mappers/nivel-cargo.mapper.js';

export { StatusDepartamento as StatusDepartamentoProto } from './grpc/proto/departamento.js';
export { NivelCargo as NivelCargoProto } from './grpc/proto/departamento.js';
export { type DepartamentoDashboardResult as DepartamentoDashboardResponse } from './grpc/proto/departamento.js';
export type { GetDashboardRequest as DepartamentoDashboardRequest } from './grpc/proto/departamento.js';
