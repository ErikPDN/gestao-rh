export * from './interfaces/funcionario-result.interface.js';
export * from './dto/create-funcionario.dto.js';
export * from './dto/update-funcionario.dto.js';
export * from './dto/get-funcionarios-query.dto.js';
export type {
  GetFuncionarioRequest,
  FuncionarioResponse,
  FuncionarioServiceClient,
  FuncionarioServiceController,
} from './grpc/proto/funcionario.js';
export {
  FUNCIONARIO_PACKAGE_NAME,
  FuncionarioServiceControllerMethods,
  FUNCIONARIO_SERVICE_NAME,
} from './grpc/proto/funcionario.js';
