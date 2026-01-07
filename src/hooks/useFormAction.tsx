import { useActionState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { ActionState } from "@/types/server-actions.types";
import { GoCheckCircleFill } from "react-icons/go";
import { IoCloseCircle } from "react-icons/io5";

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
        icon: <GoCheckCircleFill color="#12B886"/>,
        title: "Sucesso",
        message: successMessage,
        color: "#12B886",
      });
      onClose();
      lastNotificationState.current = state;
    } else if (state.error) {
      notifications.show({
        icon: <IoCloseCircle color="#FB8282"/>,
        title: "Erro",
        message: state.error,
        color: "#FB8282",
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
