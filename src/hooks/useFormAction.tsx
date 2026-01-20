import { useActionState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { GoCheckCircleFill } from "react-icons/go";
import { IoCloseCircle } from "react-icons/io5";
import { UseFormActionProps } from "@/types/useFormAction.types";



export function useFormAction<TState, TPayload = FormData>({
  action,
  initialState,
  onClose,
  successMessage,
}: UseFormActionProps<TState, TPayload>) {
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
