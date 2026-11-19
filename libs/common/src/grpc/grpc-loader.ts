// Campos `repeated` vazios não trafegam no protobuf. Com `arrays: true` o
// proto-loader os devolve como `[]` em vez de `undefined`.
export const GRPC_LOADER_OPTIONS = { arrays: true };
