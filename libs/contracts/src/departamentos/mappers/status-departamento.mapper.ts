import { StatusDepartamento, StatusDepartamentoProto } from '@app/contracts';

export const fromProtoStatusDepartamento = (
  status?: StatusDepartamentoProto,
): StatusDepartamento | undefined => {
  switch (status) {
    case StatusDepartamentoProto.STATUS_DEPARTAMENTO_ATIVO:
      return StatusDepartamento.ATIVO;
    case StatusDepartamentoProto.STATUS_DEPARTAMENTO_INATIVO:
      return StatusDepartamento.INATIVO;
    default:
      return undefined;
  }
};

export const toProtoStatusDepartamento = (
  status?: StatusDepartamento,
): StatusDepartamentoProto | undefined => {
  switch (status) {
    case StatusDepartamento.ATIVO:
      return StatusDepartamentoProto.STATUS_DEPARTAMENTO_ATIVO;
    case StatusDepartamento.INATIVO:
      return StatusDepartamentoProto.STATUS_DEPARTAMENTO_INATIVO;
    default:
      return undefined;
  }
};
