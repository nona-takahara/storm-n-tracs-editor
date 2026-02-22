export const EditArea = "edit-area" as const;
export const AddArea = "add-area" as const;
export const EditTrack = "edit-track" as const;

export type EditMode = typeof EditArea | typeof AddArea | typeof EditTrack;

