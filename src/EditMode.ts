export const EditArea = Symbol();
export const AddArea = Symbol();
export const EditTrack = Symbol();

export type EditMode = typeof EditArea | typeof AddArea | typeof EditTrack;

