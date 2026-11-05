import { Pressable, PressableProps } from "react-native";

interface ModalButtonProps extends PressableProps {
    className?: string;
}

export default function ModalButton({
    className = "",
    ...props
}: ModalButtonProps) {
    return <Pressable {...props} className={className} />;
}
