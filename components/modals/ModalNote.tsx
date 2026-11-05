import { Text, TextProps } from "react-native";

interface ModalNoteProps extends TextProps {
    className?: string;
}

export default function ModalNote({
    className = "",
    ...props
}: ModalNoteProps) {
    return <Text {...props} className={`modal-note ${className}`.trim()} />;
}
