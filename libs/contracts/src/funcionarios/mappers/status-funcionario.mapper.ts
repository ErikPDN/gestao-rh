import { StatusFuncionarioProto } from '../index.js';
import { StatusFuncionario } from '../types/status-funcionario.enum.js';

export const toProtoStatus = (
  status?: StatusFuncionario,
): StatusFuncionarioProto | undefined => {
  switch (status) {
    case StatusFuncionario.ATIVO:
      return StatusFuncionarioProto.STATUS_FUNCIONARIO_ATIVO;
    case StatusFuncionario.DESLIGADO:
      return StatusFuncionarioProto.STATUS_FUNCIONARIO_DESLIGADO;
    default:
      return undefined;
  }
};

export const fromProtoStatus = (
  status?: StatusFuncionarioProto,
): StatusFuncionario | undefined => {
  switch (status) {
    case StatusFuncionarioProto.STATUS_FUNCIONARIO_ATIVO:
      return StatusFuncionario.ATIVO;
    case StatusFuncionarioProto.STATUS_FUNCIONARIO_DESLIGADO:
      return StatusFuncionario.DESLIGADO;
    default:
      return undefined;
  }
};
