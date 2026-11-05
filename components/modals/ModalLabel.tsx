import { Text, TextProps } from "react-native";

interface ModalLabelProps extends TextProps {
    className?: string;
}

export default function ModalLabel({
    className = "",
    ...props
}: ModalLabelProps) {
    return <Text {...props} className={`auth-label ${className}`.trim()} />;
}
