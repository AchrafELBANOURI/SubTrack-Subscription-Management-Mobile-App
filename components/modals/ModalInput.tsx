import { TextInput, TextInputProps } from "react-native";

interface ModalInputProps extends TextInputProps {
    className?: string;
}

export default function ModalInput({
    className = "",
    style,
    ...props
}: ModalInputProps) {
    return (
        <TextInput
            {...props}
            className={`auth-input ${className}`.trim()}
            style={{ ...style , paddingLeft : 15 , textAlignVertical: "center"}}
        />
    );
}
