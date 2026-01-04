import { Button, createTheme, Input, InputBase, LoadingOverlay, NumberInput, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { dateParser } from './dateParser';

const theme = createTheme({
    fontFamily: "Inter, sans-serif",
    primaryColor: "primary",
    colors: {
        primary: ["#7439FA", "#8A4DFB", "#A160FC", "#B874FD", "#C988FE", "#D89CFF", "#7439FA", "#F1C4FF", "#F9D8FF", "#FFFFFF"],
    },
    components: {
        Input: {
            styles: () => ({
                input: {
                    border: "none",
                    borderBottom: `1px solid oklch(87% 0 0)`,
                    borderRadius: 0,
                }
            })
        },
        InputBase: {
            styles: () => ({
                input: {
                    border: "none",
                    borderBottom: `1px solid oklch(87% 0 0)`,
                    borderRadius: 0,
                }
            })
        },
        TextInput: {
            styles: () => ({
                input: {
                    border: "none",
                    borderBottom: `1px solid oklch(87% 0 0)`,
                    borderRadius: 0,
                }
            })
        },
        NumberInput: {
            defaultProps: {
                allowDecimal: true,
                decimalSeparator: ",",
                thousandSeparator: ".",
            },
            styles: () => ({
                input: {
                    border: "none",
                    borderBottom: `1px solid oklch(87% 0 0)`,
                    borderRadius: 0,
                }
            })
        },
        LoadingOverlay: {
            defaultProps: {
                loaderProps: {
                    color: "primary",
                    type: "dots"
                },
                overlayProps: {
                    radius: "sm",
                    blur: 2
                },
                zIndex: 9999
            }
        },
        Button: {
            defaultProps: {
                className: "text-sm! font-medium! tracking-wider w-full md:w-fit! ml-auto",
                color: "#7439FA",
                radius: "lg",
                size: "md"
            },
        },
        DateInput: {
            defaultProps: {
                dateParser: dateParser,
                locale: "pt-BR",
                valueFormat: "DD/MM/YYYY"
            }
        }
    }
});

export { theme };