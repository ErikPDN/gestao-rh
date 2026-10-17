import { NivelCargo, NivelCargoProto } from '../index.js';

export const fromProtoCargoNivel = (
  nivel?: NivelCargoProto,
): NivelCargo | undefined => {
  switch (nivel) {
    case NivelCargoProto.NIVEL_CARGO_TRAINEE:
      return NivelCargo.TRAINEE;
    case NivelCargoProto.NIVEL_CARGO_JUNIOR:
      return NivelCargo.JUNIOR;
    case NivelCargoProto.NIVEL_CARGO_PLENO:
      return NivelCargo.PLENO;
    case NivelCargoProto.NIVEL_CARGO_SENIOR:
      return NivelCargo.SENIOR;
    case NivelCargoProto.NIVEL_CARGO_ESPECIALISTA:
      return NivelCargo.ESPECIALISTA;
    default:
      return undefined;
  }
};

export const toProtoCargoNivel = (
  nivel?: NivelCargo,
): NivelCargoProto | undefined => {
  switch (nivel) {
    case NivelCargo.TRAINEE:
      return NivelCargoProto.NIVEL_CARGO_TRAINEE;
    case NivelCargo.JUNIOR:
      return NivelCargoProto.NIVEL_CARGO_JUNIOR;
    case NivelCargo.PLENO:
      return NivelCargoProto.NIVEL_CARGO_PLENO;
    case NivelCargo.SENIOR:
      return NivelCargoProto.NIVEL_CARGO_SENIOR;
    case NivelCargo.ESPECIALISTA:
      return NivelCargoProto.NIVEL_CARGO_ESPECIALISTA;
    default:
      return undefined;
  }
};
