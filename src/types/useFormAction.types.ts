import { ActionState } from "./server-actions.types";

type ActionFunction<TState, TPayload = FormData> = (
  state: ActionState<TState>,
  payload: TPayload
) => Promise<ActionState<TState>>;

export interface UseFormActionProps<TState, TPayload = FormData> {
  action: ActionFunction<TState, TPayload>;
  initialState: ActionState<TState>;
  onClose: () => void;
  successMessage: string;
}