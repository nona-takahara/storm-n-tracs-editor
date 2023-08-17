export const EditArea = Symbol();
export const AddArea = Symbol();

export type EditMode = typeof EditArea | typeof AddArea;

