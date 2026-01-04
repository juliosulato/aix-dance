import { useActionState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { ActionState } from "@/types/server-actions.types";

type ActionFunction<T> = (
  state: ActionState<T>,
  payload: FormData
) => Promise<ActionState<T>>;

interface UseFormActionProps<T> {
  action: ActionFunction<T>;
  initialState: ActionState<T>;
  onClose: () => void;
  successMessage: string;
}

export function useFormAction<T>({
  action,
  initialState,
  onClose,
  successMessage,
}: UseFormActionProps<T>) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const lastNotificationState = useRef(initialState);
  
  useEffect(() => {
    if (state === lastNotificationState.current) {
      return;
    }

    if (state.success) {
      notifications.show({
        title: "Sucesso",
        message: successMessage,
        color: "green",
      });
      onClose();
      lastNotificationState.current = state;
    } else if (state.error) {
      notifications.show({
        title: "Erro",
        message: state.error,
        color: "red",
      });
      lastNotificationState.current = state;
    }
  }, [state, onClose, successMessage]);

  return {
    state,
    formAction,
    pending,
  };
}
